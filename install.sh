#!/bin/bash
set -e

REPO="https://github.com/mvmerge/merge-code.git"
INSTALL_DIR="$HOME/.merge"

echo "Installing merge..."

# Check for bun
if ! command -v bun &> /dev/null; then
  echo "Error: bun is required. Install it at https://bun.sh"
  exit 1
fi

# Check for git
if ! command -v git &> /dev/null; then
  echo "Error: git is required."
  exit 1
fi

# Clone or update
if [ -d "$INSTALL_DIR" ]; then
  echo "Updating existing install..."
  git -C "$INSTALL_DIR" pull --quiet
else
  git clone --quiet --depth=1 "$REPO" "$INSTALL_DIR"
fi

# Install dependencies
cd "$INSTALL_DIR"
bun install --quiet

# Find the preload script
PRELOAD=$(find "$INSTALL_DIR" -path "*/opentui/solid/scripts/preload.ts" 2>/dev/null | head -1)

if [ -z "$PRELOAD" ]; then
  echo "Error: could not find @opentui/solid preload script after bun install."
  exit 1
fi

ENTRY="$INSTALL_DIR/packages/opencode/src/index.ts"

# Write the launcher script
cat > /tmp/merge-bin << SCRIPT
#!/bin/bash
exec bun run --conditions=browser --preload "$PRELOAD" "$ENTRY" "\$@"
SCRIPT

chmod +x /tmp/merge-bin

# Install to /usr/local/bin
if mv /tmp/merge-bin /usr/local/bin/merge 2>/dev/null; then
  true
else
  sudo mv /tmp/merge-bin /usr/local/bin/merge
fi

echo ""
echo "Done! Run 'merge' to get started."
