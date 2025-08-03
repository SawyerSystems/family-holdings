# Family Holdings Application

A React application for managing family contributions, loans, and financial holdings.

## Features

- Member management
- Contribution tracking
- Loan requests and management
- Admin dashboard
- Family overview

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python)
- **Styling**: Tailwind with purple/orange theme

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- npm or yarn

### Setup

1. Clone the repository
2. Run the setup script:

```bash
./setup-dev.sh
```

Or manually:

```bash
# Install frontend dependencies
npm install

# Setup Python backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### Running the Application

To run both frontend and backend concurrently:

```bash
npm run dev:full
```

Or run them separately:

```bash
# Frontend only (port 5273)
npm run dev

# Backend only (port 8000)
npm run backend:dev
```

## Port Configuration

- **Frontend**: Running on port 5273
- **Backend**: Running on port 8000

## Scripts

- `npm run dev` - Start the frontend development server
- `npm run backend:dev` - Start the backend server
- `npm run dev:full` - Start both frontend and backend
- `npm run kill:all` - Kill processes running on ports 5273 and 8000
- `npm run backend:setup` - Set up the Python virtual environment

## Development Notes

This application is configured to run in a development container. Use the browser URL shortcut `$BROWSER http://localhost:5273` to open the application in your host's browser.
