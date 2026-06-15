#!/usr/bin/env bash
# cross-treasury installer - symlinks the skill into ~/.claude/skills/
# and installs Node deps. Idempotent: safe to re-run.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_SRC="$REPO_DIR/skills/cross-treasury"
SKILL_DST="$HOME/.claude/skills/cross-treasury"

if [ ! -d "$SKILL_SRC" ]; then
  echo "ERROR: $SKILL_SRC not found. Run install.sh from inside the cloned repo." >&2
  exit 1
fi

mkdir -p "$HOME/.claude/skills"

if [ -L "$SKILL_DST" ]; then
  current="$(readlink "$SKILL_DST")"
  if [ "$current" = "$SKILL_SRC" ]; then
    echo "ok symlink already points at $SKILL_SRC"
  else
    echo "updating symlink: $SKILL_DST -> $SKILL_SRC (was $current)"
    rm "$SKILL_DST"
    ln -s "$SKILL_SRC" "$SKILL_DST"
  fi
elif [ -e "$SKILL_DST" ]; then
  echo "ERROR: $SKILL_DST already exists and is NOT a symlink." >&2
  echo "  Move/back it up, then re-run install.sh." >&2
  exit 1
else
  ln -s "$SKILL_SRC" "$SKILL_DST"
  echo "ok symlinked $SKILL_DST -> $SKILL_SRC"
fi

echo "installing Node deps in $SKILL_SRC ..."
( cd "$SKILL_SRC" && CI=true npm ci --no-audit --no-fund --silent )
echo "ok deps installed"

if [ ! -f "$SKILL_SRC/.env" ]; then
  cat <<EOF

NEXT STEPS
  1. Create your treasury env file:
       cp $SKILL_SRC/.env.example $SKILL_SRC/.env
       chmod 600 $SKILL_SRC/.env
     Then edit policy values and add PRIVATE_KEY only if writes are needed.

  2. Try read-only planning:
       "show CROSS treasury status"
       "plan my CROSS treasury allocation"
       "check CROSS treasury risk gates"

EOF
else
  echo "ok $SKILL_SRC/.env already present - skipping setup"
fi
