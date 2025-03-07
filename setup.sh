#!/bin/bash

# R00TS Setup Script
echo "Setting up R00TS production environment..."

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "MongoDB is not installed. Please install MongoDB first."
    echo "Visit: https://www.mongodb.com/docs/manual/installation/"
    exit 1
fi

# Navigate to server directory
cd "$(dirname "$0")/server"

# Install dependencies
echo "Installing server dependencies..."
npm install

# Check if .env file exists, create if not
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update the .env file with your MongoDB connection string if needed."
fi

# Start the server
echo "Starting R00TS server..."
echo "The server will be available at http://localhost:5000"
echo "Open index.html in your browser to use the application"
npm start
