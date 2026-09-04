"""
CHRONOS-WS Model Evaluation Engine & Baseline Metrics Comparison.
Implements:
1. Persistence Naive Baseline (predicts S_t+1 = S_t).
2. Numerical prediction evaluation metrics (MSE, MAE, RMSE, MAPE).
3. LSTM vs. Baseline comparative analysis.
"""

import numpy as np
from typing import Dict, Any, List, Tuple
from app.models.schemas import NetworkState


class PersistenceNaiveBaseline:
    """
    Naive Persistence Baseline Model for Time-Series Prediction:
    Predicts S_(t+1) = S_t.
    """
    def __init__(self):
        self.model_name = "Persistence Naive Baseline (S_t+1 = S_t)"

    def predict(self, feature_sequences: np.ndarray) -> np.ndarray:
        """
        Given feature tensor sequence of shape (num_samples, seq_len, num_features),
        predicts the last timestep vector as the future state.
        """
        # Return S_t (last element of sequence)
        return feature_sequences[:, -1, :]


def compute_regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes numerical regression metrics for NetworkState predictions.
    y_true: np.ndarray of shape (num_samples, num_features)
    y_pred: np.ndarray of shape (num_samples, num_features)
    """
    mse = float(np.mean((y_true - y_pred) ** 2))
    mae = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(mse))
    
    # MAPE with epsilon protection against division by zero
    eps = 1e-5
    mape = float(np.mean(np.abs((y_true - y_pred) / (np.abs(y_true) + eps))) * 100.0)

    return {
        "mse": round(mse, 6),
        "mae": round(mae, 6),
        "rmse": round(rmse, 6),
        "mape_percent": round(mape, 2)
    }


def compare_models(
    lstm_metrics: Dict[str, float],
    baseline_metrics: Dict[str, float]
) -> Dict[str, Any]:
    """
    Compares LSTM World Model against Persistence Naive Baseline.
    Calculates percentage error reduction.
    """
    base_mse = baseline_metrics.get("mse", 1e-4)
    lstm_mse = lstm_metrics.get("mse", 1e-4)
    
    mse_reduction_pct = round(((base_mse - lstm_mse) / max(base_mse, 1e-6)) * 100.0, 2)
    
    base_mae = baseline_metrics.get("mae", 1e-4)
    lstm_mae = lstm_metrics.get("mae", 1e-4)
    mae_reduction_pct = round(((base_mae - lstm_mae) / max(base_mae, 1e-6)) * 100.0, 2)

    return {
        "lstm_metrics": lstm_metrics,
        "baseline_metrics": baseline_metrics,
        "comparison": {
            "mse_reduction_percent": mse_reduction_pct,
            "mae_reduction_percent": mae_reduction_pct,
            "outperforms_baseline": lstm_mse <= base_mse
        }
    }
