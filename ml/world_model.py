"""
CHRONOS-WS Stage 7 Lightweight Temporal World Model.
PyTorch-based LSTM neural network predicting future NetworkState (S_t+1) given historical state sequence (S_t-k ... S_t).
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dataclasses import dataclass, field, asdict
from typing import Dict, Any, Tuple, List, Optional
import torch
import torch.nn as nn


@dataclass
class WorldModelConfig:
    """Configurable Hyperparameters for Temporal LSTM World Model."""
    input_size: int = 19
    hidden_size: int = 64
    num_layers: int = 2
    sequence_length: int = 10
    output_size: int = 19
    learning_rate: float = 0.001
    batch_size: int = 16
    epochs: int = 20
    prediction_horizon: int = 1
    model_version: str = "v1.0.0"
    model_mode: str = "SYNTHETIC DEMO MODEL"  # "SYNTHETIC DEMO MODEL" vs "DATASET-TRAINED MODEL"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class LightweightTemporalLSTM(nn.Module):
    """
    Lightweight LSTM Network for NetworkState Temporal Sequence Modeling:
    S_(t-k) ... S_(t) -> LSTM -> Predicted S_(t+1)
    """
    def __init__(self, config: Optional[WorldModelConfig] = None):
        super().__init__()
        self.config = config or WorldModelConfig()
        
        self.lstm = nn.LSTM(
            input_size=self.config.input_size,
            hidden_size=self.config.hidden_size,
            num_layers=self.config.num_layers,
            batch_first=True,
            dropout=0.1 if self.config.num_layers > 1 else 0.0
        )
        
        # Dense head for predicting next state feature vector
        self.fc_state = nn.Sequential(
            nn.Linear(self.config.hidden_size, self.config.hidden_size // 2),
            nn.ReLU(),
            nn.Linear(self.config.hidden_size // 2, self.config.output_size)
        )

        # Confidence estimation head [0.0, 1.0]
        self.fc_confidence = nn.Sequential(
            nn.Linear(self.config.hidden_size, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Forward pass:
        x: Tensor of shape (batch_size, sequence_length, input_size)
        Returns:
            pred_state: Tensor of shape (batch_size, output_size)
            confidence: Tensor of shape (batch_size, 1)
        """
        lstm_out, (hn, cn) = self.lstm(x)
        # Extract representation from the last sequence step
        last_step_rep = lstm_out[:, -1, :]
        
        pred_state = self.fc_state(last_step_rep)
        confidence = self.fc_confidence(last_step_rep)
        return pred_state, confidence
