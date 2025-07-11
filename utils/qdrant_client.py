import hashlib
import json
import os
import urllib.request


def text_to_vector(text, dim=32):
    """Convert text to a deterministic vector of floats 0..1."""
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    vec = [b / 255 for b in digest[:dim]]
    if dim > len(vec):
        vec += [0.0] * (dim - len(vec))
    return vec


def add_ticket_text(ticket_id, text, collection="tickets", qdrant_url=None):
    """Add ticket text to a Qdrant collection."""
    url = qdrant_url or os.getenv("QDRANT_URL", "http://localhost:6333")
    vector = text_to_vector(text)
    payload = {
        "points": [
            {"id": ticket_id, "payload": {"text": text}, "vector": vector}
        ]
    }
    req = urllib.request.Request(
        f"{url}/collections/{collection}/points",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="PUT",
    )
    with urllib.request.urlopen(req) as resp:
        return json.load(resp)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Add ticket text to Qdrant")
    parser.add_argument("--id", type=int, required=True, help="Ticket ID")
    parser.add_argument("--text", required=True, help="Ticket text")
    parser.add_argument("--collection", default="tickets", help="Collection name")
    parser.add_argument("--url", default=None, help="Qdrant base URL")
    args = parser.parse_args()

    result = add_ticket_text(args.id, args.text, args.collection, args.url)
    print(json.dumps(result, indent=2))
