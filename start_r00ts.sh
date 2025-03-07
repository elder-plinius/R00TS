#!/bin/bash

# R00TS Easy Startup Script
echo "========================================"
echo "Starting R00TS Application"
echo "========================================"

cd "$(dirname "$0")"

# Check if server is already running
if pgrep -f "node.*server.js" > /dev/null; then
    echo "R00TS server is already running!"
else
    # Check if MongoDB is running
    if ! pgrep -x mongod > /dev/null; then
        echo "Starting MongoDB..."
        if [[ "$(uname)" == "Darwin" ]]; then
            # macOS
            brew services start mongodb-community || mongod --config /usr/local/etc/mongod.conf --fork
        elif [[ "$(uname)" == "Linux" ]]; then
            # Linux
            sudo systemctl start mongodb || sudo service mongodb start
        fi
    fi
    
    # Start the server
    echo "Starting R00TS server..."
    cd server
    npm start &
    cd ..
    echo "Server starting in background..."
fi

# Wait for server to start
echo "Waiting for server to start..."
sleep 3

# Check if server is running
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "Server is running!"
    
    # Open the application in the default browser
    echo "Opening R00TS in your browser..."
    
    if [[ "$(uname)" == "Darwin" ]]; then
        # macOS
        open "http://localhost:5000"
    elif [[ "$(uname)" == "Linux" ]]; then
        # Linux
        xdg-open "http://localhost:5000" || firefox "http://localhost:5000" || google-chrome "http://localhost:5000"
    elif [[ "$(uname)" == "MINGW"* ]]; then
        # Windows
        start "http://localhost:5000"
    fi
    
    # Open dashboard in browser
    echo "Opening admin dashboard..."
    if [[ "$(uname)" == "Darwin" ]]; then
        # macOS
        open "dashboard.html"
    elif [[ "$(uname)" == "Linux" ]]; then
        # Linux
        xdg-open "dashboard.html" || firefox "dashboard.html" || google-chrome "dashboard.html"
    elif [[ "$(uname)" == "MINGW"* ]]; then
        # Windows
        start "dashboard.html"
    fi
else
    echo "Server failed to start. Please check the logs in server/logs directory."
fi

echo "========================================"
echo "R00TS is now ready!"
echo "To stop the server, run: cd server && npm stop"
echo "========================================"
