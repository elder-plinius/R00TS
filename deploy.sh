#!/bin/bash

# R00TS Autonomous Deployment Script
# This script automates the deployment of the R00TS application

echo "========================================"
echo "R00TS Autonomous Deployment"
echo "========================================"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "MongoDB is not installed. Installing MongoDB..."
    
    # Detect OS and install MongoDB accordingly
    if [[ "$(uname)" == "Darwin" ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew tap mongodb/brew
            brew install mongodb-community
            brew services start mongodb-community
        else
            echo "Homebrew is required to install MongoDB on macOS."
            echo "Please install Homebrew first: https://brew.sh/"
            exit 1
        fi
    elif [[ "$(uname)" == "Linux" ]]; then
        # Linux (Ubuntu/Debian assumed)
        sudo apt-get update
        sudo apt-get install -y mongodb
        sudo systemctl start mongodb
    else
        echo "Unsupported operating system. Please install MongoDB manually."
        echo "Visit: https://www.mongodb.com/docs/manual/installation/"
        exit 1
    fi
    
    echo "MongoDB installed successfully!"
fi

# Navigate to the project directory
cd "$(dirname "$0")"

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 process manager..."
    npm install -g pm2
fi

# Navigate to server directory and install dependencies
echo "Setting up server..."
cd server

# Install server dependencies
npm install

# Check if .env file exists, create if not
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update the .env file with your MongoDB connection string if needed."
fi

# Start the server with PM2
echo "Starting R00TS server with PM2..."
npm run prod

# Setup PM2 to start on system boot
pm2 startup
echo "Run the above command if you want PM2 to start on system boot"

# Setup PM2 to save current process list
pm2 save

# Display status
echo "\nR00TS server is now running!"
echo "========================================"
echo "Server Status:"
pm2 status r00ts-server
echo "========================================"
echo "Health Check:"
curl -s http://localhost:5000/api/health | json_pp || echo "Health check endpoint not accessible"
echo "\n========================================"
echo "To view server logs: npm run logs"
echo "To restart server: npm run restart"
echo "To stop server: npm run stop"
echo "\nOpen index.html in your browser to use the application"
echo "========================================"
