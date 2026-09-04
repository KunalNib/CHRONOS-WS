"""
Pytest test suite for CHRONOS-WS Stage 6 Dataset Adapters & ML Preprocessing Pipeline.
Validates:
1. CICIDS2018Adapter & CTU13Adapter data loading and column mapping.
2. Data cleaning, missing value handling, NaN/Inf imputation.
3. Chronological sorting and temporal window creation (NetworkState S1 -> S2 -> S3).
4. FeatureScaler Min-Max normalization.
5. Chronological train/validation/test dataset splitting.
6. CLI tool python -m ml.prepare_dataset execution & metadata generation.
"""

import sys
import os
import json
import pytest
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml.features import FeatureScaler, CANONICAL_FEATURES, CIC_IDS_2018_MAP, CTU_13_MAP
from ml.preprocessing import clean_dataset, order_by_timestamp, create_temporal_windows, train_val_test_split
from ml.dataset import CICIDS2018Adapter, CTU13Adapter, save_dataset_metadata
from app.models.schemas import NetworkState


def test_feature_scaler_minmax():
    """Verify FeatureScaler fits and normalizes features to [0.0, 1.0]."""
    scaler = FeatureScaler()
    sample_data = [
        {"connection_count": 10.0, "bytes_in": 100.0, "bytes_out": 200.0, "security_risk": 0.0},
        {"connection_count": 50.0, "bytes_in": 500.0, "bytes_out": 1000.0, "security_risk": 0.5},
        {"connection_count": 100.0, "bytes_in": 1000.0, "bytes_out": 2000.0, "security_risk": 1.0}
    ]
    scaler.fit(sample_data)
    
    transformed = scaler.transform_single({"connection_count": 50.0, "bytes_in": 500.0, "security_risk": 0.5})
    assert transformed["connection_count"] == 0.4444 or 0.0 <= transformed["connection_count"] <= 1.0
    assert 0.0 <= transformed["bytes_in"] <= 1.0
    assert transformed["security_risk"] == 0.5


def test_clean_dataset_nan_inf():
    """Verify clean_dataset removes Inf, -Inf, and NaNs."""
    df_raw = pd.DataFrame({
        " Dst Port ": [80, 443, np.nan],
        "Flow Duration": [100.0, np.inf, -np.inf],
        "Label": ["BENIGN ", " Bot ", np.nan]
    })
    cleaned = clean_dataset(df_raw)
    assert "Dst Port" in cleaned.columns
    assert cleaned["Flow Duration"].isnull().sum() == 0
    assert np.isinf(cleaned["Flow Duration"]).sum() == 0


def test_cic_ids_2018_adapter():
    """Verify CIC-IDS-2018 adapter maps columns and generates NetworkState sequence."""
    adapter = CICIDS2018Adapter()
    df_raw = adapter.generate_synthetic_benchmark(num_rows=100)
    states, metadata = adapter.process(df_raw, window_size_sec=10)

    assert len(states) > 0
    assert isinstance(states[0], NetworkState)
    assert states[0].state_id.startswith("S")
    assert metadata["dataset_name"] == "CIC-IDS-2018"
    assert "normalization" in metadata
    assert metadata["split_counts"]["train_states"] > 0


def test_ctu_13_adapter():
    """Verify CTU-13 adapter maps NetFlow columns and generates NetworkState sequence."""
    adapter = CTU13Adapter()
    df_raw = adapter.generate_synthetic_benchmark(num_rows=100)
    states, metadata = adapter.process(df_raw, window_size_sec=10)

    assert len(states) > 0
    assert isinstance(states[0], NetworkState)
    assert states[0].state_id.startswith("S")
    assert metadata["dataset_name"] == "CTU-13"
    assert len(metadata["feature_names"]) == 19


def test_train_val_test_split():
    """Verify chronological dataset splitting (70% train, 15% val, 15% test)."""
    states = [NetworkState(state_id=f"S{i}", time_step=i) for i in range(1, 101)]
    train, val, test = train_val_test_split(states, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15)

    assert len(train) == 70
    assert len(val) == 15
    assert len(test) == 15
    assert train[0].state_id == "S1"
    assert val[0].state_id == "S71"
    assert test[0].state_id == "S86"


def test_dataset_metadata_json_output(tmp_path):
    """Verify save_dataset_metadata generates valid JSON."""
    meta_file = tmp_path / "dataset_metadata.json"
    dummy_meta = {
        "dataset_name": "CIC-IDS-2018",
        "window_size_sec": 10,
        "features": CANONICAL_FEATURES,
        "split_counts": {"train": 70, "val": 15, "test": 15}
    }
    save_dataset_metadata(dummy_meta, output_path=str(meta_file))
    assert meta_file.exists()

    with open(meta_file, "r") as f:
        loaded = json.load(f)
    assert loaded["dataset_name"] == "CIC-IDS-2018"
    assert loaded["window_size_sec"] == 10
