#!/bin/bash

# Set up the backend Python environment
echo "Setting up Python backend environment..."
cd backend || mkdir -p backend && cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt || echo "No requirements.txt found, skipping pip install"
cd ..

# Set up the frontend
echo "Installing npm dependencies..."
npm install

echo "Setup complete! Run 'npm run dev:full' to start both frontend and backend servers."
echo "Frontend will be available at: http://localhost:5273"
echo "Backend will be available at: http://localhost:8000"
