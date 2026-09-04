"""
CHRONOS-WS Local Inference Engine for Temporal World Model.
Accepts a sequence of real stored NetworkState objects (S_t-k ... S_t) and returns the predicted future state (S_t+1),
prediction confidence score, and model mode/version metadata tag.
"""

import sys
import os
import torch
import numpy as np
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any, Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.schemas import NetworkState
from ml.features import FeatureScaler, CANONICAL_FEATURES
from ml.world_model import WorldModelConfig, LightweightTemporalLSTM


class TemporalInferenceEngine:
    """
    Inference Engine for Lightweight Temporal World Model.
    Exposes local inference method to pass real NetworkState sequences and receive predicted S_(t+1).
    """
    def __init__(self, checkpoint_path: str = "checkpoints/world_model.pth"):
        self.checkpoint_path = checkpoint_path
        self.config = WorldModelConfig()
        self.scaler = FeatureScaler()
        self.model = LightweightTemporalLSTM(self.config)
        self.model_mode = "SYNTHETIC DEMO MODEL"
        self.model_version = "v1.0.0"
        self.is_loaded = False
        
        self.load_checkpoint(checkpoint_path)

    def load_checkpoint(self, path: str):
        """Loads PyTorch model weights, feature scaler, and metadata from checkpoint file."""
        if os.path.exists(path):
            try:
                checkpoint = torch.load(path, map_location=torch.device('cpu'))
                config_dict = checkpoint.get("config", {})
                self.config = WorldModelConfig(**config_dict)
                scaler_dict = checkpoint.get("scaler", {})
                self.scaler = FeatureScaler(
                    feature_min=scaler_dict.get("feature_min", {}),
                    feature_max=scaler_dict.get("feature_max", {})
                )
                self.model = LightweightTemporalLSTM(self.config)
                self.model.load_state_dict(checkpoint["model_state_dict"])
                self.model.eval()
                self.model_mode = checkpoint.get("model_mode", "SYNTHETIC DEMO MODEL")
                self.model_version = checkpoint.get("model_version", "v1.0.0")
                self.is_loaded = True
            except Exception as e:
                print(f"⚠️ Warning loading checkpoint {path}: {e}. Falling back to default model.")
                self.model.eval()
        else:
            self.model.eval()

    def predict_next_state(
        self,
        sequence: List[NetworkState]
    ) -> Tuple[NetworkState, float, str]:
        """
        Main Inference API:
        Accepts sequence of stored NetworkState objects [S_t-k ... S_t].
        Returns:
            predicted_state: NetworkState object representing S_t+1
            confidence: float prediction confidence score [0.0, 1.0]
            model_tag: string label clearly identifying mode ('SYNTHETIC DEMO MODEL' vs 'DATASET-TRAINED MODEL')
        """
        if not sequence:
            fallback_state = NetworkState(state_id="S_pred_fallback", time_step=1)
            return fallback_state, 0.50, f"{self.model_version} [{self.model_mode}]"

        seq_len = self.config.sequence_length

        # Extract & normalize feature vectors
        raw_dicts = [st.model_dump() for st in sequence]
        norm_dicts = self.scaler.transform_batch(raw_dicts)
        norm_matrix = [[d.get(feat, 0.0) for feat in CANONICAL_FEATURES] for d in norm_dicts]

        # Truncate or pad to match sequence_length
        if len(norm_matrix) >= seq_len:
            seq_slice = norm_matrix[-seq_len:]
        else:
            padding = [norm_matrix[0]] * (seq_len - len(norm_matrix))
            seq_slice = padding + norm_matrix

        x_tensor = torch.tensor([seq_slice], dtype=torch.float32)

        # Run PyTorch forward pass
        self.model.eval()
        with torch.no_grad():
            pred_norm_feats_tensor, conf_tensor = self.model(x_tensor)
            pred_norm_feats = pred_norm_feats_tensor.numpy()[0]
            confidence = float(conf_tensor.numpy()[0][0])

        # Denormalize predicted vector back to original feature scale
        denorm_feats = {}
        for idx, feat in enumerate(CANONICAL_FEATURES):
            norm_val = float(np.clip(pred_norm_feats[idx], 0.0, 1.0))
            f_min = self.scaler.feature_min.get(feat, 0.0)
            f_max = self.scaler.feature_max.get(feat, 1.0)
            
            if f_max > f_min:
                real_val = f_min + norm_val * (f_max - f_min)
            else:
                real_val = norm_val * 100.0 if "load" in feat or "count" in feat else norm_val

            denorm_feats[feat] = max(0.0, real_val)

        last_state = sequence[-1]
        next_timestep = last_state.time_step + self.config.prediction_horizon
        next_seq = last_state.transition_sequence + 1

        risk_score = round(float(np.clip(denorm_feats.get("security_risk", 0.05), 0.0, 1.0)), 3)
        threat_level = "LOW"
        if risk_score > 0.7:
            threat_level = "CRITICAL"
        elif risk_score > 0.4:
            threat_level = "HIGH"
        elif risk_score > 0.15:
            threat_level = "ELEVATED"

        predicted_state = NetworkState(
            timestamp=datetime.now(timezone.utc).isoformat(),
            time_step=next_timestep,
            state_id=f"S{next_timestep}_pred",
            window_size_sec=last_state.window_size_sec,
            transition_sequence=next_seq,
            active_threat_level=threat_level,
            connection_count=round(float(denorm_feats.get("connection_count", 50.0)), 1),
            bytes_in=round(float(denorm_feats.get("bytes_in", 20000.0)), 1),
            bytes_out=round(float(denorm_feats.get("bytes_out", 40000.0)), 1),
            packets=round(float(denorm_feats.get("packets", 600.0)), 1),
            unique_sources=round(float(denorm_feats.get("unique_sources", 10.0)), 1),
            unique_destinations=round(float(denorm_feats.get("unique_destinations", 5.0)), 1),
            unique_ports=round(float(denorm_feats.get("unique_ports", 4.0)), 1),
            syn_count=round(float(denorm_feats.get("syn_count", 0.0)), 1),
            rst_count=round(float(denorm_feats.get("rst_count", 0.0)), 1),
            request_rate=round(float(denorm_feats.get("request_rate", 5.0)), 1),
            failed_login_count=round(float(denorm_feats.get("failed_login_count", 0.0)), 1),
            authentication_failure_rate=round(float(np.clip(denorm_feats.get("authentication_failure_rate", 0.0), 0.0, 1.0)), 3),
            database_query_rate=round(float(denorm_feats.get("database_query_rate", 10.0)), 1),
            suspicious_event_count=round(float(denorm_feats.get("suspicious_event_count", 0.0)), 1),
            cpu_load=round(float(np.clip(denorm_feats.get("cpu_load", 25.0), 0.0, 100.0)), 1),
            memory_load=round(float(np.clip(denorm_feats.get("memory_load", 35.0), 0.0, 100.0)), 1),
            active_connections=round(float(denorm_feats.get("active_connections", 30.0)), 1),
            security_risk=risk_score,
            asset_risk=round(float(np.clip(denorm_feats.get("asset_risk", risk_score * 0.9), 0.0, 1.0)), 3)
        )

        model_tag = f"{self.model_version} [{self.model_mode}]"
        return predicted_state, round(confidence, 4), model_tag
