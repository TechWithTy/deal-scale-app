#!/bin/bash
# Sync main repository and all submodules in one go

set -e

echo "🔄 Syncing main repository and all submodules..."

# Get list of submodules
SUBMODULES=$(git submodule foreach --quiet 'echo $name')

if [ -z "$SUBMODULES" ]; then
    echo "No submodules found."
else
    echo "Found submodules: $SUBMODULES"
    echo ""
    
    # Sync each submodule
    for submodule in $SUBMODULES; do
        echo "📦 Processing submodule: $submodule"
        
        # Check if submodule has changes
        if git -C "$submodule" diff --quiet && git -C "$submodule" diff --cached --quiet; then
            echo "  ✓ No changes in $submodule"
        else
            echo "  ⚠️  Changes detected in $submodule"
            echo "  Run 'git add $submodule && git commit -m \"...\"' in $submodule first"
        fi
    done
    echo ""
fi

# Update submodule references in main repo
echo "📌 Updating submodule references in main repository..."
git add $(git submodule foreach --quiet 'echo $name')

# Show status
echo ""
echo "📊 Current status:"
git status --short

echo ""
echo "✅ Ready to commit main repository with updated submodule references"
echo "   Run: git commit -m \"your message\""



