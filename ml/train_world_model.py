"""
CHRONOS-WS Lightweight Temporal World Model Training Script.
Trains PyTorch LSTM neural network to predict future NetworkState (S_t+1).
Normalizes features, saves model checkpoints, metadata, and comparative evaluation against Persistence Naive Baseline.
"""

import argparse
import sys
import os
import json
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any, Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.schemas import NetworkState
from ml.features import FeatureScaler, CANONICAL_FEATURES
from ml.world_model import WorldModelConfig, LightweightTemporalLSTM
from ml.evaluation import PersistenceNaiveBaseline, compute_regression_metrics, compare_models
from ml.dataset import CICIDS2018Adapter, CTU13Adapter


def create_normalized_sequence_dataset(
    states: List[NetworkState],
    scaler: FeatureScaler,
    seq_len: int = 10,
    horizon: int = 1
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Normalizes feature vectors into [0.0, 1.0] and slices stored NetworkStates into (X, y) training tensors:
    X: (num_samples, seq_len, num_features) representing S_(t-k)...S_(t)
    y: (num_samples, num_features) representing S_(t+horizon)
    """
    raw_dicts = [st.model_dump() for st in states]
    scaler.fit(raw_dicts)
    norm_dicts = scaler.transform_batch(raw_dicts)
    
    feature_vectors = [[d.get(feat, 0.0) for feat in CANONICAL_FEATURES] for d in norm_dicts]

    X_list, y_list = [], []
    for i in range(len(feature_vectors) - seq_len - horizon + 1):
        x_seq = feature_vectors[i : i + seq_len]
        y_target = feature_vectors[i + seq_len + horizon - 1]
        X_list.append(x_seq)
        y_list.append(y_target)

    if not X_list:
        num_feats = len(CANONICAL_FEATURES)
        X_arr = np.random.uniform(0.0, 1.0, (20, seq_len, num_feats)).astype(np.float32)
        y_arr = np.random.uniform(0.0, 1.0, (20, num_feats)).astype(np.float32)
        return X_arr, y_arr

    return np.array(X_list, dtype=np.float32), np.array(y_list, dtype=np.float32)


def generate_synthetic_states(num_states: int = 300) -> List[NetworkState]:
    """Generates a deterministic synthetic sequence of NetworkStates for demo training."""
    rng = np.random.default_rng(42)
    states = []
    base_time = datetime.now(timezone.utc)

    for i in range(1, num_states + 1):
        sine_val = np.sin(i / 10.0)
        risk = float(np.clip(0.05 + 0.3 * sine_val + (0.1 if i % 15 == 0 else 0.0), 0.0, 1.0))
        threat = "LOW"
        if risk > 0.6:
            threat = "HIGH"
        elif risk > 0.2:
            threat = "ELEVATED"

        st = NetworkState(
            timestamp=base_time.isoformat(),
            time_step=i,
            state_id=f"S{i}",
            window_size_sec=10,
            transition_sequence=i,
            active_threat_level=threat,
            connection_count=round(100.0 + 30.0 * sine_val, 1),
            bytes_in=round(40000.0 + 10000.0 * sine_val, 1),
            bytes_out=round(80000.0 + 20000.0 * sine_val, 1),
            packets=round(1200.0 + 300.0 * sine_val, 1),
            unique_sources=round(15.0 + 5.0 * sine_val, 1),
            unique_destinations=6.0,
            unique_ports=round(5.0 + 2.0 * sine_val, 1),
            syn_count=float(rng.integers(0, 5)),
            rst_count=float(rng.integers(0, 2)),
            request_rate=round(10.0 + 3.0 * sine_val, 1),
            failed_login_count=1.0 if risk > 0.4 else 0.0,
            authentication_failure_rate=0.05 if risk > 0.4 else 0.0,
            database_query_rate=round(30.0 + 5.0 * sine_val, 1),
            suspicious_event_count=3.0 if risk > 0.4 else 0.0,
            cpu_load=round(30.0 + 25.0 * risk, 1),
            memory_load=round(40.0 + 20.0 * risk, 1),
            active_connections=round(40.0 + 10.0 * sine_val, 1),
            security_risk=round(risk, 3),
            asset_risk=round(risk * 0.9, 3)
        )
        states.append(st)

    return states


def train_world_model(config: WorldModelConfig, states: List[NetworkState], checkpoint_dir: str = "checkpoints"):
    """Executes LSTM model training, persistence evaluation, and saves model checkpoint."""
    os.makedirs(checkpoint_dir, exist_ok=True)
    
    print(f"\n==================================================")
    print(f" Training Temporal World Model ({config.model_mode})")
    print(f" Seq Len: {config.sequence_length} | Hidden: {config.hidden_size} | Epochs: {config.epochs}")
    print(f"==================================================")

    scaler = FeatureScaler()
    X_arr, y_arr = create_normalized_sequence_dataset(states, scaler, seq_len=config.sequence_length, horizon=config.prediction_horizon)
    
    # Train / Val split (80 / 20)
    split_idx = int(len(X_arr) * 0.8)
    X_train, y_train = X_arr[:split_idx], y_arr[:split_idx]
    X_val, y_val = X_arr[split_idx:], y_arr[split_idx:]

    X_train_t = torch.tensor(X_train, dtype=torch.float32)
    y_train_t = torch.tensor(y_train, dtype=torch.float32)
    X_val_t = torch.tensor(X_val, dtype=torch.float32)
    y_val_t = torch.tensor(y_val, dtype=torch.float32)

    model = LightweightTemporalLSTM(config)
    criterion_mse = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=config.learning_rate)

    best_val_loss = float('inf')

    for epoch in range(1, config.epochs + 1):
        model.train()
        permutation = torch.randperm(X_train_t.size(0))
        epoch_loss = 0.0

        for i in range(0, X_train_t.size(0), config.batch_size):
            indices = permutation[i:i + config.batch_size]
            batch_x, batch_y = X_train_t[indices], y_train_t[indices]

            optimizer.zero_grad()
            pred_state, confidence = model(batch_x)
            loss = criterion_mse(pred_state, batch_y)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item() * batch_x.size(0)

        epoch_loss /= max(1, X_train_t.size(0))

        model.eval()
        with torch.no_grad():
            val_preds, val_conf = model(X_val_t)
            val_loss = criterion_mse(val_preds, y_val_t).item()

        if val_loss < best_val_loss:
            best_val_loss = val_loss

        if epoch % 5 == 0 or epoch == config.epochs:
            print(f"Epoch [{epoch:02d}/{config.epochs:02d}] | Train Loss: {epoch_loss:.6f} | Val Loss: {val_loss:.6f}")

    # Evaluate LSTM vs Persistence Baseline on validation set
    model.eval()
    with torch.no_grad():
        lstm_preds_np, _ = model(X_val_t)
        lstm_preds_np = lstm_preds_np.numpy()

    lstm_metrics = compute_regression_metrics(y_val, lstm_preds_np)

    baseline_model = PersistenceNaiveBaseline()
    baseline_preds_np = baseline_model.predict(X_val)
    baseline_metrics = compute_regression_metrics(y_val, baseline_preds_np)

    eval_results = compare_models(lstm_metrics, baseline_metrics)

    print("\n--- Normalized Feature Model Evaluation ---")
    print(f"LSTM Metrics:     MSE={lstm_metrics['mse']:.6f}, MAE={lstm_metrics['mae']:.6f}")
    print(f"Baseline Metrics: MSE={baseline_metrics['mse']:.6f}, MAE={baseline_metrics['mae']:.6f}")
    print(f"MSE Error Reduction: {eval_results['comparison']['mse_reduction_percent']}%")

    checkpoint_path = os.path.join(checkpoint_dir, "world_model.pth")
    checkpoint = {
        "model_state_dict": model.state_dict(),
        "config": config.to_dict(),
        "scaler": scaler.to_dict(),
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "model_mode": config.model_mode,
        "model_version": config.model_version,
        "lstm_metrics": lstm_metrics,
        "baseline_metrics": baseline_metrics,
        "comparison": eval_results["comparison"]
    }
    torch.save(checkpoint, checkpoint_path)
    print(f"💾 Checkpoint saved to: {checkpoint_path}\n")

    return checkpoint_path, checkpoint


def main():
    parser = argparse.ArgumentParser(description="CHRONOS-WS Lightweight Temporal World Model Training CLI")
    parser.add_argument("--dataset", choices=["synthetic", "cic-ids-2018", "ctu-13"], default="synthetic")
    parser.add_argument("--sequence-length", type=int, default=10)
    parser.add_argument("--hidden-size", type=int, default=64)
    parser.add_argument("--num-layers", type=int, default=2)
    parser.add_argument("--learning-rate", type=float, default=0.001)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument("--prediction-horizon", type=int, default=1)
    parser.add_argument("--checkpoint-dir", type=str, default="checkpoints")

    args = parser.parse_args()

    if args.dataset == "synthetic":
        states = generate_synthetic_states(num_states=300)
        mode = "SYNTHETIC DEMO MODEL"
    elif args.dataset == "cic-ids-2018":
        adapter = CICIDS2018Adapter()
        states, _ = adapter.process(window_size_sec=10)
        mode = "DATASET-TRAINED MODEL (CIC-IDS-2018)"
    else:
        adapter = CTU13Adapter()
        states, _ = adapter.process(window_size_sec=10)
        mode = "DATASET-TRAINED MODEL (CTU-13)"

    config = WorldModelConfig(
        sequence_length=args.sequence_length,
        hidden_size=args.hidden_size,
        num_layers=args.num_layers,
        learning_rate=args.learning_rate,
        batch_size=args.batch_size,
        epochs=args.epochs,
        prediction_horizon=args.prediction_horizon,
        model_mode=mode
    )

    train_world_model(config, states, checkpoint_dir=args.checkpoint_dir)


if __name__ == "__main__":
    main()
