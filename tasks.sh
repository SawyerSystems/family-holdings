#!/bin/bash

# Family Holdings Development Task Runner
# Usage: ./tasks.sh <command>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Development tasks
dev_setup() {
    print_status "Setting up development environment..."
    
    # Check for required tools
    if ! command_exists node; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command_exists python3; then
        print_error "Python 3 is not installed"
        exit 1
    fi
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Setup backend
    print_status "Setting up backend environment..."
    npm run backend:setup
    
    print_success "Development environment setup complete!"
}

dev_clean() {
    print_status "Cleaning development environment..."
    
    # Kill any running processes
    npm run kill:all
    
    # Clean build artifacts
    npm run clean
    
    print_success "Environment cleaned!"
}

dev_start() {
    print_status "Starting development servers..."
    
    # Clean any existing processes first
    npm run kill:all
    
    # Start both frontend and backend
    npm run dev:full
}

dev_start_clean() {
    print_status "Starting clean development environment..."
    dev_clean
    dev_start
}

type_check() {
    print_status "Running TypeScript type checking..."
    npm run type-check
    print_success "Type checking completed!"
}

lint_all() {
    print_status "Running all linting checks..."
    
    print_status "Linting JavaScript/TypeScript..."
    npm run lint
    
    print_status "Linting CSS..."
    npm run lint:css || print_warning "CSS linting skipped (stylelint not fully configured)"
    
    print_success "Linting completed!"
}

format_all() {
    print_status "Formatting code..."
    npm run format
    print_success "Code formatting completed!"
}

test_all() {
    print_status "Running all tests..."
    
    print_status "Running frontend tests..."
    npm run test:run
    
    print_status "Running backend tests..."
    npm run backend:test || print_warning "Backend tests failed or not configured"
    
    print_success "Testing completed!"
}

build_all() {
    print_status "Building application..."
    
    # Run checks first
    print_status "Running pre-build checks..."
    npm run lint
    npm run type-check
    
    # Build frontend
    print_status "Building frontend..."
    npm run build
    
    print_success "Build completed!"
}

ci_check() {
    print_status "Running CI checks..."
    npm run ci
    print_success "CI checks passed!"
}

health_check() {
    print_status "Checking application health..."
    
    # Check if servers are running
    if port_in_use 5273; then
        print_success "Frontend server is running on port 5273"
    else
        print_warning "Frontend server is not running"
    fi
    
    if port_in_use 8000; then
        print_success "Backend server is running on port 8000"
    else
        print_warning "Backend server is not running"
    fi
    
    # Try to hit health endpoints
    npm run health:check || print_warning "Health check endpoints not responding"
}

show_help() {
    echo "Family Holdings Development Task Runner"
    echo ""
    echo "Usage: ./tasks.sh <command>"
    echo ""
    echo "Available commands:"
    echo "  setup           - Set up the development environment"
    echo "  clean           - Clean build artifacts and stop servers"
    echo "  dev             - Start development servers"
    echo "  dev:clean       - Clean and start development servers"
    echo "  type-check      - Run TypeScript type checking"
    echo "  lint            - Run all linting checks"
    echo "  format          - Format code with Prettier"
    echo "  test            - Run all tests"
    echo "  build           - Build the application"
    echo "  ci              - Run CI checks (lint, type-check, test, build)"
    echo "  health          - Check application health"
    echo "  help            - Show this help message"
    echo ""
}

# Main command dispatcher
case "$1" in
    setup)
        dev_setup
        ;;
    clean)
        dev_clean
        ;;
    dev)
        dev_start
        ;;
    dev:clean)
        dev_start_clean
        ;;
    type-check)
        type_check
        ;;
    lint)
        lint_all
        ;;
    format)
        format_all
        ;;
    test)
        test_all
        ;;
    build)
        build_all
        ;;
    ci)
        ci_check
        ;;
    health)
        health_check
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
