# R00TS Backend Server

This is the backend server for the R00TS application, providing API endpoints for word and dataset management.

## Features

- RESTful API for word submissions and retrieval
- MongoDB integration for persistent data storage
- Automatic dataset creation and backup
- Production-ready configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. Clone the repository (if you haven't already)
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on the `.env.example` template:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your MongoDB connection string

## Running the Server

### Development Mode

```
npm run dev
```

This will start the server with nodemon, which automatically restarts when changes are detected.

### Production Mode

```
npm start
```

## API Endpoints

### Words

- `GET /api/words` - Get all words
- `POST /api/words` - Add or update a word
- `GET /api/words/stats` - Get word statistics

### Datasets

- `GET /api/datasets` - Get all datasets (limited info)
- `GET /api/datasets/:filename` - Get a specific dataset by filename
- `POST /api/datasets` - Create a new dataset snapshot
- `GET /api/datasets/recent/list` - Get recent datasets (limited to 5)

## Deployment

For production deployment, we recommend:

1. Set up a MongoDB Atlas cluster for your database
2. Update the `.env` file with your production MongoDB URI
3. Deploy to a hosting service like Heroku, Vercel, or DigitalOcean

## Data Migration

If you have existing data in localStorage that you want to migrate to the database:

1. Export your localStorage data
2. Use the import functionality (coming soon) to upload to the server

## License

See the main project license file.
