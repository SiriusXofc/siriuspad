#!/usr/bin/env bash

set -euo pipefail

REPO="${SIRIUSPAD_REPO:-Nic85796/siriuspad}"
FORMAT="deb"

print_error() {
  printf 'SiriusPad install error: %s\n' "$1" >&2
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    print_error "required command not found: $1"
    exit 1
  fi
}

usage() {
  cat <<'EOF'
Usage:
  bash scripts/install-linux.sh [--deb|--appimage|--rpm]

Options:
  --deb       Download and install the latest .deb package
  --appimage  Download the latest AppImage into ~/.local/bin
  --rpm       Download and install the latest .rpm package

Environment:
  SIRIUSPAD_REPO=owner/repo  Override the GitHub repository used for releases
EOF
}

for arg in "$@"; do
  case "$arg" in
    --deb)
      FORMAT="deb"
      ;;
    --appimage)
      FORMAT="appimage"
      ;;
    --rpm)
      FORMAT="rpm"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      print_error "unknown argument: $arg"
      usage
      exit 1
      ;;
  esac
done

require_cmd curl
require_cmd python3
require_cmd mktemp

api_url="https://api.github.com/repos/${REPO}/releases/latest"
release_json="$(curl -fsSL "$api_url")" || {
  print_error "could not fetch latest release from ${api_url}. Make sure the repository has a published release."
  exit 1
}

download_url="$(
  python3 - "$FORMAT" <<'PY' <<<"$release_json"
import json
import sys

payload = json.load(sys.stdin)
wanted = sys.argv[1]
suffix_map = {
    "deb": ".deb",
    "appimage": ".AppImage",
    "rpm": ".rpm",
}
suffix = suffix_map[wanted]
for asset in payload.get("assets", []):
    url = asset.get("browser_download_url", "")
    if url.endswith(suffix):
        print(url)
        break
PY
)"

if [[ -z "$download_url" ]]; then
  print_error "latest release does not contain a .$FORMAT asset yet."
  exit 1
fi

temp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$temp_dir"
}
trap cleanup EXIT

asset_name="$(basename "$download_url")"
asset_path="$temp_dir/$asset_name"

printf 'Downloading %s\n' "$download_url"
curl -fL "$download_url" -o "$asset_path" || {
  print_error "download failed for $download_url"
  exit 1
}

case "$FORMAT" in
  deb)
    if command -v apt-get >/dev/null 2>&1; then
      printf 'Installing %s via apt\n' "$asset_name"
      if [[ "${EUID}" -eq 0 ]]; then
        apt-get install -y "$asset_path"
      else
        sudo apt-get install -y "$asset_path"
      fi
    else
      print_error "apt-get is required to install the .deb package"
      exit 1
    fi
    ;;
  rpm)
    if command -v rpm >/dev/null 2>&1; then
      printf 'Installing %s via rpm\n' "$asset_name"
      if [[ "${EUID}" -eq 0 ]]; then
        rpm -Uvh "$asset_path"
      else
        sudo rpm -Uvh "$asset_path"
      fi
    else
      print_error "rpm is required to install the .rpm package"
      exit 1
    fi
    ;;
  appimage)
    target_dir="${HOME}/.local/bin"
    mkdir -p "$target_dir"
    target_path="${target_dir}/SiriusPad.AppImage"
    install -m 0755 "$asset_path" "$target_path"
    printf 'Installed AppImage to %s\n' "$target_path"
    printf 'You can run it with: %s\n' "$target_path"
    ;;
esac

printf 'SiriusPad install completed successfully.\n'
