#!/usr/bin/env python3

# Test script to verify loan limit calculation
import requests
import json

BASE_URL = "http://localhost:8000"
HEADERS = {
    "X-User-Id": "5e98e9eb-375b-49f6-82bc-904df30c4021",
    "X-User-Role": "admin",
    "Content-Type": "application/json"
}

def test_loan_capacity():
    """Test the loan capacity endpoint"""
    response = requests.get(f"{BASE_URL}/loans/my-capacity", headers=HEADERS)
    print("=== Loan Capacity (Before) ===")
    print(json.dumps(response.json(), indent=2))
    return response.json()

def test_stats():
    """Test the stats endpoint"""
    response = requests.get(f"{BASE_URL}/stats/me", headers=HEADERS)
    print("=== User Stats ===")
    print(json.dumps(response.json(), indent=2))
    return response.json()

if __name__ == "__main__":
    print("Testing loan limit calculation...")
    
    # Test current capacity (should be 0)
    capacity_before = test_loan_capacity()
    
    # Test current stats
    stats = test_stats()
    
    print("\n=== Test Summary ===")
    print(f"Total Contributed: ${capacity_before['total_contributed']}")
    print(f"Borrowing Limit: ${capacity_before['borrowing_limit']} (75% of contributions)")
    print(f"Available Credit: ${capacity_before['available_credit']}")
    print(f"Loan to Contribution Ratio: {capacity_before['loan_to_contribution_ratio']}")
