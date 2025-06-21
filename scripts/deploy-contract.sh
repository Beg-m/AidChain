#!/bin/bash

# AidChain Smart Contract Deployment Script
# This script deploys the Soroban smart contract to Stellar testnet

set -e

echo "🚀 Deploying AidChain Smart Contract to Stellar Testnet..."

# Check if soroban CLI is installed
if ! command -v soroban &> /dev/null; then
    echo "❌ Soroban CLI is not installed. Please install it first:"
    echo "   https://soroban.stellar.org/docs/getting-started/setup"
    exit 1
fi

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed. Please install it first:"
    echo "   https://rustup.rs/"
    exit 1
fi

# Set network to testnet
echo "📡 Setting network to testnet..."
soroban config network set --global testnet

# Build the contract
echo "🔨 Building smart contract..."
cd contracts
cargo build --target wasm32-unknown-unknown --release

# Deploy the contract
echo "📦 Deploying contract..."
CONTRACT_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/aidchain_contract.wasm \
    --source testnet \
    --network testnet)

echo "✅ Contract deployed successfully!"
echo "📋 Contract ID: $CONTRACT_ID"

# Save contract ID to .env file
echo "💾 Saving contract ID to .env file..."
echo "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID" > ../.env.local

echo "🎉 Deployment completed!"
echo "📝 Contract ID has been saved to .env.local"
echo "🔗 You can now use the smart contract in your application"
echo ""
echo "Next steps:"
echo "1. Restart your development server"
echo "2. The contract will be automatically available in your app"
echo "3. Test the smart contract functionality" 