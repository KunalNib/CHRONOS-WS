# 📊 CHRONOS-WS Dataset & Preprocessing Specification

This document details the dataset support architecture, column mapping, data cleaning, feature extraction, temporal window creation, normalization, and split criteria for **CIC-IDS-2018** and **CTU-13** datasets.

---

## 1. Dataset Adapters Architecture

The machine learning preprocessing engine (`ml/`) translates heterogeneous intrusion detection datasets into standard, sequential `NetworkState` ($S_t$) representations suitable for sequence modeling and attack-path prediction.

### Supported Datasets:
1. **CIC-IDS-2018** (Canadian Institute for Cybersecurity Intrusion Detection Dataset 2018)
2. **CTU-13** (CTU University Botnet & NetFlow Benchmark Dataset)

---

## 2. Column Mapping & Schema Normalization

### CIC-IDS-2018 Column Mapping
| Raw CIC-IDS-2018 Column | Mapped Internal Field | Description |
|-------------------------|-----------------------|-------------|
| `Timestamp` | `timestamp` | Flow start timestamp |
| `Dst Port` | `dest_port` | Target port |
| `Protocol` | `protocol` | L4 Protocol |
| `Flow Duration` | `duration` | Microseconds duration |
| `Tot Fwd Pkts` | `fwd_packets` | Forward packet count |
| `Tot Bwd Pkts` | `bwd_packets` | Backward packet count |
| `TotLen Fwd Pkts` | `bytes_out` | Transmitted payload bytes |
| `TotLen Bwd Pkts` | `bytes_in` | Received payload bytes |
| `Fwd Pkts/s` | `fwd_pkt_rate` | Forward rate |
| `Bwd Pkts/s` | `bwd_pkt_rate` | Backward rate |
| `SYN Flag Cnt` | `syn_count` | SYN flag count |
| `RST Flag Cnt` | `rst_count` | RST flag count |
| `Src IP` | `source_ip` | Source IP address |
| `Dst IP` | `dest_ip` | Destination IP address |
| `Label` | `label` | Flow attack classification |

### CTU-13 Column Mapping
| Raw CTU-13 NetFlow Column | Mapped Internal Field | Description |
|---------------------------|-----------------------|-------------|
| `StartTime` | `timestamp` | Flow start timestamp |
| `Dur` | `duration` | Flow duration in seconds |
| `Proto` | `protocol` | Network protocol |
| `SrcAddr` | `source_ip` | Source IP address |
| `DstAddr` | `dest_ip` | Destination IP address |
| `Dport` | `dest_port` | Destination port |
| `TotPkts` | `packets` | Total packet count |
| `TotBytes` | `bytes_total` | Total byte count |
| `SrcBytes` | `bytes_out` | Transmitted bytes |
| `Label` | `label` | NetFlow label |

---

## 3. Data Cleaning & Preprocessing

`ml/preprocessing.py` performs rigorous cleaning prior to state sequence conversion:
1. **Header & String Trimming**: Strips leading/trailing whitespace from column headers and string values.
2. **Missing Value Imputation**: Replaces `np.inf` and `-np.inf` values with `np.nan`, then imputes numeric `NaN` values with column medians.
3. **Timestamp Sorting**: Converts timestamps to standardized ISO-8601 format and chronologically sorts records.

---

## 4. 10-Second Temporal Window Creation

Raw packet/flow rows are aggregated into rolling 10-second temporal windows:
- **State Sequence Generation**: Converts windows into ordered `NetworkState` objects ($S_1 \rightarrow S_2 \rightarrow S_3 \rightarrow S_4$).
- **Aggregated Vector**: Calculates `connection_count`, `bytes_in`, `bytes_out`, `packets`, `unique_sources`, `unique_destinations`, `unique_ports`, `syn_count`, `rst_count`, `request_rate`, `security_risk`, and `asset_risk`.

---

## 5. Normalization & Feature Scaling

`FeatureScaler` applies Min-Max feature normalization across all 19 canonical features:

$$\hat{x} = \frac{x - x_{\text{min}}}{x_{\text{max}} - x_{\text{min}}}$$

All bounds ($x_{\text{min}}$, $x_{\text{max}}$) are calculated per dataset and stored in `processed_data/dataset_metadata.json`.

---

## 6. Train / Validation / Test Splitting

To preserve temporal sequence dependencies:
- **Train Set**: First **70%** of chronological states ($S_1 \dots S_{70}$)
- **Validation Set**: Middle **15%** of chronological states ($S_{71} \dots S_{85}$)
- **Test Set**: Final **15%** of chronological states ($S_{86} \dots S_{100}$)

---

## 7. CLI Usage

Run the dataset preparation tool:

```bash
# Process CIC-IDS-2018 dataset
python -m ml.prepare_dataset --dataset cic-ids-2018 --window-size 10

# Process CTU-13 dataset
python -m ml.prepare_dataset --dataset ctu-13 --window-size 10

# Process all supported datasets
python -m ml.prepare_dataset --dataset all --window-size 10
```

---

## 8. Metadata JSON Format (`processed_data/dataset_metadata.json`)

```json
{
  "cic-ids-2018": {
    "dataset_name": "CIC-IDS-2018",
    "processed_at": "2026-09-04T00:50:00Z",
    "raw_record_count": 500,
    "cleaned_record_count": 500,
    "generated_state_count": 100,
    "window_size_sec": 10,
    "feature_names": [
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
    ],
    "normalization": {
      "feature_min": { ... },
      "feature_max": { ... }
    },
    "split_ratio": {
      "train": 0.7,
      "val": 0.15,
      "test": 0.15
    },
    "split_counts": {
      "train_states": 70,
      "val_states": 15,
      "test_states": 15
    }
  }
}
```
