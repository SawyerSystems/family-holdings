#!/bin/bash

function show_help {
    echo "Family Holdings Application Management Script"
    echo "Usage: ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start both frontend and backend servers"
    echo "  stop        - Stop all running servers on ports 5273 and 8000"
    echo "  frontend    - Start only the frontend server"
    echo "  backend     - Start only the backend server"
    echo "  setup       - Run the setup script"
    echo "  status      - Check if servers are running"
    echo "  help        - Show this help message"
    echo ""
}

function check_status {
    echo "Checking server status..."
    
    # Check frontend (port 5273)
    if lsof -ti:5273 > /dev/null; then
        echo "✅ Frontend is running on port 5273"
    else
        echo "❌ Frontend is not running"
    fi
    
    # Check backend (port 8000)
    if lsof -ti:8000 > /dev/null; then
        echo "✅ Backend is running on port 8000"
    else
        echo "❌ Backend is not running"
    fi
}

case "$1" in
    start)
        echo "Starting all servers..."
        npm run dev:full
        ;;
    stop)
        echo "Stopping all servers..."
        npm run kill:all
        check_status
        ;;
    frontend)
        echo "Starting frontend server..."
        npm run dev
        ;;
    backend)
        echo "Starting backend server..."
        npm run backend:dev
        ;;
    setup)
        echo "Running setup..."
        ./setup-dev.sh
        ;;
    status)
        check_status
        ;;
    help|*)
        show_help
        ;;
esac
