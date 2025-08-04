#!/bin/bash

# Start development servers for Family Holdings app

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Family Holdings Dev Environment ====${NC}"
echo -e "${YELLOW}Starting development servers...${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo -e "${RED}ERROR: .env file not found!${NC}"
  echo "Creating a sample .env file from .env.example..."
  
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${GREEN}Created .env file from example. Please update with your credentials.${NC}"
  else
    echo -e "${RED}ERROR: .env.example file not found! Cannot create .env file.${NC}"
    exit 1
  fi
fi

# Setup Python environment if needed
if [ ! -d "backend/venv" ]; then
  echo -e "${YELLOW}Python virtual environment not found. Setting up...${NC}"
  cd backend
  python -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  cd ..
  echo -e "${GREEN}Python environment setup complete!${NC}"
fi

# Start backend server in the background
echo -e "${YELLOW}Starting backend server on port 8000...${NC}"
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --port 8000 --host 0.0.0.0 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo -e "${YELLOW}Starting frontend server on port 5273...${NC}"
npm run dev

# Cleanup when the script is terminated
cleanup() {
  echo -e "${YELLOW}Shutting down servers...${NC}"
  kill $BACKEND_PID
  echo -e "${GREEN}Servers stopped.${NC}"
  exit 0
}

# Register the cleanup function for when the script receives SIGINT
trap cleanup SIGINT

# Wait for the frontend process to finish
wait
