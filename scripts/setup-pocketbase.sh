#!/bin/sh
set -e

PB_VERSION="0.23.12"
DEST_DIR="pocketbase"

OS=$(uname -s)
ARCH=$(uname -m)

case "$OS" in
  Darwin)
    case "$ARCH" in
      arm64) PLATFORM="darwin_arm64" ;;
      x86_64) PLATFORM="darwin_amd64" ;;
      *) echo "Unsupported macOS architecture: $ARCH"; exit 1 ;;
    esac
    ;;
  Linux)
    case "$ARCH" in
      x86_64) PLATFORM="linux_amd64" ;;
      aarch64) PLATFORM="linux_arm64" ;;
      *) echo "Unsupported Linux architecture: $ARCH"; exit 1 ;;
    esac
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${PLATFORM}.zip"

echo "Downloading PocketBase v${PB_VERSION} for ${PLATFORM}..."

mkdir -p "$DEST_DIR"

TMP_ZIP=$(mktemp)
curl -fsSLk "$URL" -o "$TMP_ZIP"
unzip -o "$TMP_ZIP" pocketbase -d "$DEST_DIR"
rm "$TMP_ZIP"

chmod +x "$DEST_DIR/pocketbase"

echo ""
echo "PocketBase v${PB_VERSION} installed to ${DEST_DIR}/pocketbase"
echo "Run 'npm run pb:serve' to start PocketBase."
echo "Create your admin account at http://127.0.0.1:8090/_/"
