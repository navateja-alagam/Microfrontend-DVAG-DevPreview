#!/usr/bin/env bash
set -euo pipefail

CERT_DIR="$(cd "$(dirname "$0")/.." && pwd)/.cert"

if ! command -v mkcert &> /dev/null; then
    echo "mkcert is not installed."
    echo ""
    echo "Install it first:"
    echo "  macOS:   brew install mkcert && mkcert -install"
    echo "  Linux:   https://github.com/FiloSottile/mkcert#installation"
    echo "  Windows: choco install mkcert && mkcert -install"
    exit 1
fi

mkdir -p "$CERT_DIR"

echo "Generating certificates for dvag-demo.com and localhost..."
mkcert -key-file "$CERT_DIR/key.pem" -cert-file "$CERT_DIR/cert.pem" \
    dvag-demo.com localhost 127.0.0.1 ::1

echo ""
echo "Certificates written to $CERT_DIR/"
echo ""
echo "Make sure dvag-demo.com resolves to 127.0.0.1."
echo "Add this line to /etc/hosts if it's not there already:"
echo "  127.0.0.1  dvag-demo.com"
