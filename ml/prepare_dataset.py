"""
CHRONOS-WS Dataset Preparation CLI Tool.
Usage:
    python -m ml.prepare_dataset --dataset cic-ids-2018 --window-size 10
    python -m ml.prepare_dataset --dataset ctu-13 --window-size 10
    python -m ml.prepare_dataset --generate-benchmark
"""

import argparse
import sys
import os
import json
from datetime import datetime, timezone

# Ensure project root & backend in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml.dataset import CICIDS2018Adapter, CTU13Adapter, save_dataset_metadata


def main():
    parser = argparse.ArgumentParser(description="CHRONOS-WS Stage 6 Dataset Adapter & Preprocessing CLI")
    parser.add_argument(
        "--dataset",
        choices=["cic-ids-2018", "ctu-13", "all"],
        default="cic-ids-2018",
        help="Select dataset adapter to run (cic-ids-2018, ctu-13, or all)"
    )
    parser.add_argument(
        "--input-file",
        type=str,
        default=None,
        help="Path to raw dataset CSV file (optional, uses synthetic benchmark if not provided)"
    )
    parser.add_argument(
        "--window-size",
        type=int,
        default=10,
        help="Temporal aggregation window size in seconds (default: 10)"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="processed_data",
        help="Output directory for processed NetworkState sequences and metadata"
    )
    parser.add_argument(
        "--generate-benchmark",
        action="store_true",
        help="Force generate synthetic benchmark datasets for validation"
    )

    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    datasets_to_process = [args.dataset] if args.dataset != "all" else ["cic-ids-2018", "ctu-13"]

    all_metadata = {}

    for ds_name in datasets_to_process:
        print(f"\n==================================================")
        print(f" Processing Dataset Adapter: {ds_name.upper()}")
        print(f" Window Size: {args.window_size}s | Output: {args.output_dir}")
        print(f"==================================================")

        if ds_name == "cic-ids-2018":
            adapter = CICIDS2018Adapter()
        else:
            adapter = CTU13Adapter()

        states, metadata = adapter.process(
            data_source=args.input_file,
            window_size_sec=args.window_size
        )

        all_metadata[ds_name] = metadata

        # Save generated NetworkState sequences to JSON
        seq_output_file = os.path.join(args.output_dir, f"{ds_name.replace('-', '_')}_states.json")
        states_dump = [st.model_dump() for st in states]
        with open(seq_output_file, "w") as f:
            json.dump(states_dump, f, indent=2)

        print(f"✅ Successfully processed {len(states)} NetworkStates ($S_1 \\rightarrow S_2 \\rightarrow S_3$)")
        print(f"📁 NetworkStates saved to: {seq_output_file}")

    # Save metadata summary
    meta_output_file = os.path.join(args.output_dir, "dataset_metadata.json")
    save_dataset_metadata(all_metadata, output_path=meta_output_file)
    print(f"\n📊 Dataset metadata saved to: {meta_output_file}")
    print("✨ Stage 6 Dataset Preparation Complete!\n")


if __name__ == "__main__":
    main()
