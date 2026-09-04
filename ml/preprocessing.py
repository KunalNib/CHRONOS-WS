"""
CHRONOS-WS Data Preprocessing & Temporal Window Creation Pipeline.
Handles dataset cleaning, missing value interpolation, timestamp sorting, sliding temporal window aggregation,
and chronological train/validation/test splitting.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
import numpy as np
from datetime import datetime, timezone
from typing import List, Dict, Tuple, Any, Optional
from app.models.schemas import NetworkState


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw flow dataset:
    1. Trims whitespace from column names and string columns.
    2. Replaces Inf, -Inf with NaN.
    3. Imputes missing numeric values with 0.0 or column median.
    4. Drops duplicate rows.
    """
    cleaned_df = df.copy()
    
    # Trim column headers
    cleaned_df.columns = [str(col).strip() for col in cleaned_df.columns]
    
    # Trim string values
    for col in cleaned_df.select_dtypes(include=['object', 'string']).columns:
        cleaned_df[col] = cleaned_df[col].astype(str).str.strip()
        
    # Replace Inf with NaN
    cleaned_df = cleaned_df.replace([np.inf, -np.inf], np.nan)
    
    # Impute missing numeric values
    num_cols = cleaned_df.select_dtypes(include=[np.number]).columns
    for col in num_cols:
        if cleaned_df[col].isnull().sum() > 0:
            median_val = cleaned_df[col].median()
            cleaned_df[col] = cleaned_df[col].fillna(median_val if not np.isnan(median_val) else 0.0)
            
    # Fill remaining object NaNs with empty string
    obj_cols = cleaned_df.select_dtypes(include=['object', 'string']).columns
    for col in obj_cols:
        cleaned_df[col] = cleaned_df[col].fillna("")

    # Drop duplicates
    cleaned_df = cleaned_df.drop_duplicates()
    return cleaned_df


def order_by_timestamp(df: pd.DataFrame, timestamp_col: str = "timestamp") -> pd.DataFrame:
    """
    Parses timestamp column into pandas Datetime and sorts dataframe chronologically.
    """
    sorted_df = df.copy()
    if timestamp_col in sorted_df.columns:
        sorted_df[timestamp_col] = pd.to_datetime(sorted_df[timestamp_col], errors='coerce')
        # Fill missing timestamps with forward fill or baseline
        sorted_df[timestamp_col] = sorted_df[timestamp_col].ffill().bfill()
        sorted_df = sorted_df.sort_values(by=timestamp_col).reset_index(drop=True)
    return sorted_df


def create_temporal_windows(
    df: pd.DataFrame,
    timestamp_col: str = "timestamp",
    window_size_sec: int = 10
) -> List[NetworkState]:
    """
    Aggregates cleaned chronological flow telemetry into 10-second temporal windows,
    producing a sequential chain of canonical NetworkStates (S1 -> S2 -> S3 -> S4).
    """
    if df.empty:
        return []

    # Ensure timestamp ordering
    df_sorted = order_by_timestamp(df, timestamp_col)
    
    if timestamp_col in df_sorted.columns and pd.api.types.is_datetime64_any_dtype(df_sorted[timestamp_col]):
        start_time = df_sorted[timestamp_col].min()
        # Create group index based on window_size_sec
        df_sorted['window_idx'] = ((df_sorted[timestamp_col] - start_time).dt.total_seconds() // window_size_sec).astype(int)
    else:
        # Fallback: slice into fixed row chunks if no valid timestamp column
        chunk_size = max(1, len(df_sorted) // 20)
        df_sorted['window_idx'] = (np.arange(len(df_sorted)) // chunk_size).astype(int)

    network_states: List[NetworkState] = []
    grouped = df_sorted.groupby('window_idx')

    for seq_num, (w_idx, group) in enumerate(grouped, start=1):
        state_id_str = f"S{seq_num}"
        ts_str = datetime.now(timezone.utc).isoformat()
        if timestamp_col in group.columns and pd.api.types.is_datetime64_any_dtype(group[timestamp_col]):
            ts_str = group[timestamp_col].max().isoformat()

        # Extract features from flow group
        conn_cnt = float(len(group))
        bytes_in = float(group['bytes_in'].sum()) if 'bytes_in' in group.columns else conn_cnt * 1200.0
        bytes_out = float(group['bytes_out'].sum()) if 'bytes_out' in group.columns else conn_cnt * 2400.0
        pkts = float(group['packets'].sum()) if 'packets' in group.columns else conn_cnt * 10.0
        
        src_cnt = float(group['source_ip'].nunique()) if 'source_ip' in group.columns else min(50.0, max(1.0, conn_cnt * 0.2))
        dst_cnt = float(group['dest_ip'].nunique()) if 'dest_ip' in group.columns else min(10.0, max(1.0, conn_cnt * 0.1))
        port_cnt = float(group['dest_port'].nunique()) if 'dest_port' in group.columns else min(20.0, max(1.0, conn_cnt * 0.15))

        syn_cnt = float(group['syn_count'].sum()) if 'syn_count' in group.columns else 0.0
        rst_cnt = float(group['rst_count'].sum()) if 'rst_count' in group.columns else 0.0
        req_rate = float(conn_cnt / float(window_size_sec))

        # Check for attack labels in group
        suspicious_cnt = 0.0
        if 'label' in group.columns:
            suspicious_cnt = float(sum(1 for lbl in group['label'] if str(lbl).upper() not in ["BENIGN", "0", "NORMAL"]))
        elif 'severity' in group.columns:
            suspicious_cnt = float(sum(1 for sev in group['severity'] if str(sev).upper() in ["MEDIUM", "HIGH", "CRITICAL"]))

        risk_score = round(min(1.0, (suspicious_cnt / max(1.0, conn_cnt)) + (syn_cnt * 0.05)), 3)
        threat_level = "LOW"
        if risk_score > 0.7:
            threat_level = "CRITICAL"
        elif risk_score > 0.4:
            threat_level = "HIGH"
        elif risk_score > 0.15:
            threat_level = "ELEVATED"

        state = NetworkState(
            timestamp=ts_str,
            time_step=seq_num,
            state_id=state_id_str,
            window_size_sec=window_size_sec,
            transition_sequence=seq_num,
            active_threat_level=threat_level,
            connection_count=conn_cnt,
            bytes_in=bytes_in,
            bytes_out=bytes_out,
            packets=pkts,
            unique_sources=src_cnt,
            unique_destinations=dst_cnt,
            unique_ports=port_cnt,
            syn_count=syn_cnt,
            rst_count=rst_cnt,
            request_rate=req_rate,
            failed_login_count=float(syn_cnt),
            authentication_failure_rate=round(syn_cnt / max(1.0, conn_cnt), 3),
            database_query_rate=round(conn_cnt * 0.3, 1),
            suspicious_event_count=suspicious_cnt,
            cpu_load=round(min(98.0, 20.0 + (suspicious_cnt * 3.0)), 1),
            memory_load=round(min(95.0, 30.0 + (suspicious_cnt * 2.0)), 1),
            active_connections=conn_cnt,
            security_risk=risk_score,
            asset_risk=round(risk_score * 0.9, 3)
        )
        network_states.append(state)

    return network_states


def train_val_test_split(
    sequences: List[NetworkState],
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15
) -> Tuple[List[NetworkState], List[NetworkState], List[NetworkState]]:
    """
    Chronologically splits NetworkState sequence into train, validation, and test sets.
    """
    n = len(sequences)
    train_end = int(n * train_ratio)
    val_end = train_end + int(n * val_ratio)

    train_seq = sequences[:train_end]
    val_seq = sequences[train_end:val_end]
    test_seq = sequences[val_end:]

    return train_seq, val_seq, test_seq
