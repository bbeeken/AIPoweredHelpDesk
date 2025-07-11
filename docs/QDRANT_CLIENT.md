# Qdrant Client Utility

This repository includes a small Python script for sending ticket text to a Qdrant vector database.

## Requirements

- Python 3.8+
- No third‑party packages are required. The script uses the standard library.

## Usage

Run the script with the ticket ID and text you want to index:

```bash
python utils/qdrant_client.py --id 2353 --text "Reset my password" --collection tickets
```

The Qdrant base URL defaults to `http://localhost:6333` but can be changed with the `--url` option or the `QDRANT_URL` environment variable.

The script converts the text into a simple deterministic vector and upserts it into the specified collection.
