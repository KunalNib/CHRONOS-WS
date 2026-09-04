"""
Pytest test suite for CHRONOS-WS Stage 7 Lightweight Temporal World Model.
Validates:
1. LightweightTemporalLSTM architecture and forward tensor shapes.
2. Persistence Naive Baseline prediction.
3. Training on synthetic & dataset state sequences.
4. Checkpoint saving, loading, and metadata model tags ('SYNTHETIC DEMO MODEL' vs 'DATASET-TRAINED MODEL').
5. Acceptance Criteria: Real stored NetworkStates passed into TemporalInferenceEngine returning predicted S_t+1.
"""

import sys
import os
import pytest
import torch
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.schemas import NetworkState
from ml.world_model import WorldModelConfig, LightweightTemporalLSTM
from ml.evaluation import PersistenceNaiveBaseline, compute_regression_metrics, compare_models
from ml.train_world_model import train_world_model, generate_synthetic_states
from ml.inference import TemporalInferenceEngine
from ml.dataset import CICIDS2018Adapter


def test_lstm_architecture_tensor_shapes():
    """Verify LSTM forward pass accepts (batch, seq_len, 19) and outputs (batch, 19)."""
    config = WorldModelConfig(input_size=19, hidden_size=32, num_layers=1, output_size=19)
    model = LightweightTemporalLSTM(config)
    
    x = torch.randn(4, 10, 19)  # Batch of 4 sequences of length 10
    pred_state, confidence = model(x)
    
    assert pred_state.shape == (4, 19)
    assert confidence.shape == (4, 1)
    assert 0.0 <= float(confidence[0].item()) <= 1.0


def test_persistence_baseline_prediction():
    """Verify Persistence Naive Baseline returns S_t (last element in sequence)."""
    baseline = PersistenceNaiveBaseline()
    seq_data = np.zeros((2, 10, 19), dtype=np.float32)
    seq_data[:, -1, :] = 42.0  # Set last element to 42
    
    preds = baseline.predict(seq_data)
    assert preds.shape == (2, 19)
    assert np.all(preds == 42.0)


def test_metrics_and_comparison():
    """Verify regression metrics (MSE, MAE) and model comparison logic."""
    y_true = np.array([[1.0, 2.0], [3.0, 4.0]])
    y_pred = np.array([[1.1, 1.9], [2.9, 4.2]])
    
    metrics = compute_regression_metrics(y_true, y_pred)
    assert "mse" in metrics
    assert "mae" in metrics
    assert metrics["mse"] > 0.0

    comparison = compare_models(
        lstm_metrics={"mse": 0.01, "mae": 0.05},
        baseline_metrics={"mse": 0.05, "mae": 0.10}
    )
    assert comparison["comparison"]["outperforms_baseline"] is True
    assert comparison["comparison"]["mse_reduction_percent"] == 80.0


def test_train_synthetic_and_inference_acceptance(tmp_path):
    """
    Acceptance Criteria Test:
    A sequence of real stored NetworkState objects is passed into the model and a real future state prediction is returned.
    Also verifies model mode tag 'SYNTHETIC DEMO MODEL'.
    """
    chk_dir = str(tmp_path / "checkpoints")
    config = WorldModelConfig(epochs=5, model_mode="SYNTHETIC DEMO MODEL")
    states = generate_synthetic_states(num_states=100)
    
    chk_path, chk_meta = train_world_model(config, states, checkpoint_dir=chk_dir)
    assert os.path.exists(chk_path)

    # Initialize inference engine with saved checkpoint
    engine = TemporalInferenceEngine(checkpoint_path=chk_path)
    assert engine.is_loaded is True
    assert "SYNTHETIC DEMO MODEL" in engine.model_mode

    # Pass real sequence of stored NetworkStates
    seq_input = states[:10]
    predicted_state, confidence, model_tag = engine.predict_next_state(seq_input)

    assert isinstance(predicted_state, NetworkState)
    assert predicted_state.time_step == 11
    assert predicted_state.state_id.endswith("_pred")
    assert 0.0 <= confidence <= 1.0
    assert "SYNTHETIC DEMO MODEL" in model_tag


def test_train_dataset_model_tag_differentiation(tmp_path):
    """Verify system clearly distinguishes SYNTHETIC DEMO MODEL vs DATASET-TRAINED MODEL."""
    chk_dir = str(tmp_path / "checkpoints_ds")
    adapter = CICIDS2018Adapter()
    states, _ = adapter.process(window_size_sec=10)

    config = WorldModelConfig(epochs=3, model_mode="DATASET-TRAINED MODEL (CIC-IDS-2018)")
    chk_path, _ = train_world_model(config, states, checkpoint_dir=chk_dir)

    engine = TemporalInferenceEngine(checkpoint_path=chk_path)
    _, _, model_tag = engine.predict_next_state(states[:10])

    assert "DATASET-TRAINED MODEL (CIC-IDS-2018)" in model_tag
