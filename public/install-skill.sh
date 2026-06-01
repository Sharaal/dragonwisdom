#!/usr/bin/env bash
set -euo pipefail

archive_url="{skill_archive_url}"
skill_name="dragonwisdom-html"
target_root="$HOME/.agents/skills"
target_dir="$target_root/$skill_name"
temp_dir="$(mktemp -d)"
archive_file="$temp_dir/SKILL.zip"

cleanup() {
  rm -rf "$temp_dir"
}

trap cleanup EXIT

if ! command -v unzip >/dev/null 2>&1; then
  echo "Missing required command: unzip" >&2
  exit 1
fi

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$archive_url" -o "$archive_file"
elif command -v wget >/dev/null 2>&1; then
  wget -qO "$archive_file" "$archive_url"
else
  echo "Missing required command: curl or wget" >&2
  exit 1
fi

mkdir -p "$target_root"
rm -rf "$target_dir"
unzip -q "$archive_file" -d "$target_root"

echo "Installed DragonWisdom HTML skill to $target_dir"
