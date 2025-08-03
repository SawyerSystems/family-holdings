#!/bin/bash

echo "Reloading VS Code Python settings..."
touch /workspaces/family-holdings/.vscode/settings.json
echo "VS Code Python settings reloaded. Please try the following steps:"
echo "1. Close and reopen all Python files"
echo "2. Run the Python: Select Interpreter command from the Command Palette"
echo "3. Choose the interpreter at /workspaces/family-holdings/backend/venv/bin/python"
echo ""
echo "If you still see import errors, try restarting VS Code entirely."
