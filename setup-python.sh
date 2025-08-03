#!/bin/bash

# This script helps reload the Python environment in VS Code

echo "Setting up Python environment for VS Code..."

# Create Python virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    cd backend
    python -m venv venv
    cd ..
fi

# Activate the virtual environment and install dependencies
echo "Installing Python dependencies..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# Create or update VS Code settings
mkdir -p .vscode
cat > .vscode/settings.json << EOF
{
    "python.defaultInterpreterPath": "\${workspaceFolder}/backend/venv/bin/python",
    "python.analysis.extraPaths": ["\${workspaceFolder}/backend/venv/lib/python3.12/site-packages"],
    "python.analysis.typeCheckingMode": "basic",
    "python.analysis.autoImportCompletions": true,
    "python.terminal.activateEnvironment": true
}
EOF

echo "Python environment setup complete."
echo "Please reload VS Code window to apply changes (Ctrl+Shift+P -> 'Developer: Reload Window')"
