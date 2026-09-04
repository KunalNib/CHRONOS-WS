"""
CHRONOS-WS Dataset Adapters for CIC-IDS-2018 and CTU-13.
Implements data loading, column mapping, data normalization, temporal aggregation, and metadata export.
"""

from abc import ABC, abstractmethod
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
import numpy as np
import json
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Tuple, Optional

from app.models.schemas import NetworkState
from ml.features import CIC_IDS_2018_MAP, CTU_13_MAP, CANONICAL_FEATURES, FeatureScaler
from ml.preprocessing import clean_dataset, order_by_timestamp, create_temporal_windows, train_val_test_split


class BaseDatasetAdapter(ABC):
    """Abstract Base Class for Dataset Adapters."""
    def __init__(self, dataset_name: str):
        self.dataset_name = dataset_name
        self.scaler = FeatureScaler()

    @abstractmethod
    def map_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        pass

    @abstractmethod
    def generate_synthetic_benchmark(self, num_rows: int = 500) -> pd.DataFrame:
        pass

    def load_data(self, data_source: Optional[Any] = None) -> pd.DataFrame:
        """Loads data from CSV path, DataFrame, or generates benchmark synthetic data if source is empty."""
        if isinstance(data_source, pd.DataFrame):
            return data_source
        elif isinstance(data_source, str) and os.path.exists(data_source):
            return pd.read_csv(data_source)
        else:
            return self.generate_synthetic_benchmark(num_rows=500)

    def process(
        self,
        data_source: Optional[Any] = None,
        window_size_sec: int = 10,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15
    ) -> Tuple[List[NetworkState], Dict[str, Any]]:
        """
        Executes full dataset adapter pipeline:
        1. Load data
        2. Column mapping
        3. Data cleaning
        4. Timestamp ordering
        5. Temporal window creation into NetworkStates (S1 -> S2 -> S3)
        6. Feature normalization & metadata computation
        """
        raw_df = self.load_data(data_source)
        cleaned_df = clean_dataset(raw_df)
        mapped_df = self.map_columns(cleaned_df)
        ordered_df = order_by_timestamp(mapped_df, timestamp_col="timestamp")

        states = create_temporal_windows(ordered_df, timestamp_col="timestamp", window_size_sec=window_size_sec)
        
        # Fit scaler on generated states
        features_dicts = [st.model_dump() for st in states]
        self.scaler.fit(features_dicts)

        train_seq, val_seq, test_seq = train_val_test_split(states, train_ratio, val_ratio, test_ratio)

        metadata = {
            "dataset_name": self.dataset_name,
            "processed_at": datetime.now(timezone.utc).isoformat(),
            "raw_record_count": len(raw_df),
            "cleaned_record_count": len(cleaned_df),
            "generated_state_count": len(states),
            "window_size_sec": window_size_sec,
            "feature_names": CANONICAL_FEATURES,
            "normalization": self.scaler.to_dict(),
            "split_ratio": {
                "train": train_ratio,
                "val": val_ratio,
                "test": test_ratio
            },
            "split_counts": {
                "train_states": len(train_seq),
                "val_states": len(val_seq),
                "test_states": len(test_seq)
            }
        }

        return states, metadata


class CICIDS2018Adapter(BaseDatasetAdapter):
    """Adapter for Canadian Institute for Cybersecurity IDS 2018 Dataset (CIC-IDS-2018)."""
    def __init__(self):
        super().__init__("CIC-IDS-2018")

    def map_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        mapped = pd.DataFrame()
        for src_col, target_col in CIC_IDS_2018_MAP.items():
            if src_col in df.columns:
                mapped[target_col] = df[src_col]
            else:
                # Case insensitive check
                matched = [c for c in df.columns if c.strip().lower() == src_col.lower()]
                if matched:
                    mapped[target_col] = df[matched[0]]

        # Ensure mandatory columns exist
        if "timestamp" not in mapped.columns:
            mapped["timestamp"] = [datetime.now(timezone.utc) - timedelta(seconds=i*2) for i in range(len(df))]
        if "bytes_in" not in mapped.columns:
            mapped["bytes_in"] = 1200.0
        if "bytes_out" not in mapped.columns:
            mapped["bytes_out"] = 2400.0
        if "packets" not in mapped.columns:
            mapped["packets"] = 10.0
        if "label" not in mapped.columns:
            mapped["label"] = "BENIGN"

        return mapped

    def generate_synthetic_benchmark(self, num_rows: int = 500) -> pd.DataFrame:
        rng = np.random.default_rng(42)
        start_time = datetime.now(timezone.utc) - timedelta(minutes=30)
        
        timestamps = [(start_time + timedelta(seconds=i*2)).isoformat() for i in range(num_rows)]
        dst_ports = rng.choice([80, 443, 22, 5432, 8080], size=num_rows)
        tot_fwd_pkts = rng.integers(1, 50, size=num_rows)
        tot_bwd_pkts = rng.integers(1, 100, size=num_rows)
        tot_len_fwd = tot_fwd_pkts * rng.integers(64, 1500, size=num_rows)
        tot_len_bwd = tot_bwd_pkts * rng.integers(64, 1500, size=num_rows)
        syn_flags = rng.choice([0, 1], size=num_rows, p=[0.9, 0.1])
        rst_flags = rng.choice([0, 1], size=num_rows, p=[0.95, 0.05])
        labels = rng.choice(["BENIGN", "DDOS-HOIC", "Bot", "Infiltration"], size=num_rows, p=[0.8, 0.1, 0.05, 0.05])

        df = pd.DataFrame({
            "Timestamp": timestamps,
            "Dst Port": dst_ports,
            "Protocol": 6,
            "Flow Duration": rng.integers(1000, 500000, size=num_rows),
            "Tot Fwd Pkts": tot_fwd_pkts,
            "Tot Bwd Pkts": tot_bwd_pkts,
            "TotLen Fwd Pkts": tot_len_fwd,
            "TotLen Bwd Pkts": tot_len_bwd,
            "Fwd Pkts/s": tot_fwd_pkts / 10.0,
            "Bwd Pkts/s": tot_bwd_pkts / 10.0,
            "SYN Flag Cnt": syn_flags,
            "RST Flag Cnt": rst_flags,
            "Src IP": "192.168.1.100",
            "Dst IP": "10.0.0.10",
            "Label": labels
        })
        return df


class CTU13Adapter(BaseDatasetAdapter):
    """Adapter for CTU-13 NetFlow Cyber Benchmark Dataset."""
    def __init__(self):
        super().__init__("CTU-13")

    def map_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        mapped = pd.DataFrame()
        for src_col, target_col in CTU_13_MAP.items():
            if src_col in df.columns:
                mapped[target_col] = df[src_col]
            else:
                matched = [c for c in df.columns if c.strip().lower() == src_col.lower()]
                if matched:
                    mapped[target_col] = df[matched[0]]

        if "timestamp" not in mapped.columns:
            mapped["timestamp"] = [datetime.now(timezone.utc) - timedelta(seconds=i*2) for i in range(len(df))]
        if "bytes_out" not in mapped.columns:
            mapped["bytes_out"] = 1500.0
        if "bytes_in" not in mapped.columns:
            mapped["bytes_in"] = 3000.0
        if "packets" not in mapped.columns:
            mapped["packets"] = 12.0
        if "label" not in mapped.columns:
            mapped["label"] = "Flow-Normal"

        return mapped

    def generate_synthetic_benchmark(self, num_rows: int = 500) -> pd.DataFrame:
        rng = np.random.default_rng(100)
        start_time = datetime.now(timezone.utc) - timedelta(minutes=30)
        
        timestamps = [(start_time + timedelta(seconds=i*2)).isoformat() for i in range(num_rows)]
        durations = rng.uniform(0.1, 15.0, size=num_rows)
        src_addrs = [f"147.32.84.{rng.integers(10, 200)}" for _ in range(num_rows)]
        dst_addrs = [f"147.32.80.{rng.integers(1, 20)}" for _ in range(num_rows)]
        dports = rng.choice([80, 443, 22, 53, 8080], size=num_rows)
        pkts = rng.integers(1, 80, size=num_rows)
        bytes_tot = pkts * rng.integers(100, 1200, size=num_rows)
        labels = rng.choice(["Flow-Normal", "Botnet", "Background"], size=num_rows, p=[0.75, 0.15, 0.10])

        df = pd.DataFrame({
            "StartTime": timestamps,
            "Dur": durations,
            "Proto": "tcp",
            "SrcAddr": src_addrs,
            "DstAddr": dst_addrs,
            "Dport": dports,
            "Sport": 1024,
            "TotPkts": pkts,
            "TotBytes": bytes_tot,
            "SrcBytes": bytes_tot // 2,
            "Label": labels
        })
        return df


def save_dataset_metadata(metadata: Dict[str, Any], output_path: str = "processed_data/dataset_metadata.json"):
    """Saves dataset processing metadata to JSON file."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(metadata, f, indent=2)
