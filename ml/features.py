"""
CHRONOS-WS ML Feature Definitions, Schema Mappings & Scaling Utilities.
Supports schema translation for CIC-IDS-2018 and CTU-13 datasets into canonical NetworkState feature vectors.
"""

from typing import List, Dict, Any, Tuple, Optional
import numpy as np


# 19 Canonical Features corresponding to NetworkState.feature_names()
CANONICAL_FEATURES: List[str] = [
    "connection_count",
    "bytes_in",
    "bytes_out",
    "packets",
    "unique_sources",
    "unique_destinations",
    "unique_ports",
    "syn_count",
    "rst_count",
    "request_rate",
    "failed_login_count",
    "authentication_failure_rate",
    "database_query_rate",
    "suspicious_event_count",
    "cpu_load",
    "memory_load",
    "active_connections",
    "security_risk",
    "asset_risk"
]


# CIC-IDS-2018 Schema Column Mapping
CIC_IDS_2018_MAP: Dict[str, str] = {
    "Timestamp": "timestamp",
    "Dst Port": "dest_port",
    "Protocol": "protocol",
    "Flow Duration": "duration",
    "Tot Fwd Pkts": "fwd_packets",
    "Tot Bwd Pkts": "bwd_packets",
    "TotLen Fwd Pkts": "bytes_out",
    "TotLen Bwd Pkts": "bytes_in",
    "Fwd Pkts/s": "fwd_pkt_rate",
    "Bwd Pkts/s": "bwd_pkt_rate",
    "SYN Flag Cnt": "syn_count",
    "RST Flag Cnt": "rst_count",
    "Src IP": "source_ip",
    "Dst IP": "dest_ip",
    "Label": "label"
}


# CTU-13 NetFlow Schema Column Mapping
CTU_13_MAP: Dict[str, str] = {
    "StartTime": "timestamp",
    "Dur": "duration",
    "Proto": "protocol",
    "SrcAddr": "source_ip",
    "DstAddr": "dest_ip",
    "Dport": "dest_port",
    "Sport": "source_port",
    "TotPkts": "packets",
    "TotBytes": "bytes_total",
    "SrcBytes": "bytes_out",
    "Label": "label"
}


class FeatureScaler:
    """Min-Max Normalization utility for feature vectors."""
    def __init__(self, feature_min: Optional[Dict[str, float]] = None, feature_max: Optional[Dict[str, float]] = None):
        self.feature_min: Dict[str, float] = feature_min or {}
        self.feature_max: Dict[str, float] = feature_max or {}

    def fit(self, features_dict_list: List[Dict[str, float]]):
        """Fit scaler min and max boundaries over a list of feature dictionaries."""
        if not features_dict_list:
            return

        for feat in CANONICAL_FEATURES:
            vals = [d.get(feat, 0.0) for d in features_dict_list]
            self.feature_min[feat] = float(np.min(vals))
            self.feature_max[feat] = float(np.max(vals))

    def transform_single(self, feat_dict: Dict[str, float]) -> Dict[str, float]:
        """Normalize a single feature dictionary to range [0.0, 1.0]."""
        normalized: Dict[str, float] = {}
        for feat in CANONICAL_FEATURES:
            val = float(feat_dict.get(feat, 0.0))
            f_min = self.feature_min.get(feat, 0.0)
            f_max = self.feature_max.get(feat, 1.0)
            
            if f_max > f_min:
                norm_val = (val - f_min) / (f_max - f_min)
            else:
                norm_val = 0.0
            
            normalized[feat] = round(float(np.clip(norm_val, 0.0, 1.0)), 4)
        return normalized

    def transform_batch(self, features_dict_list: List[Dict[str, float]]) -> List[Dict[str, float]]:
        """Normalize a batch of feature dictionaries."""
        return [self.transform_single(d) for d in features_dict_list]

    def to_dict(self) -> Dict[str, Any]:
        """Serialize scaler boundaries for dataset metadata storage."""
        return {
            "feature_min": self.feature_min,
            "feature_max": self.feature_max
        }
