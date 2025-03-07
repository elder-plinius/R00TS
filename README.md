# R00TS - Plant the Seeds of Artificial Intelligence

R00TS is an interactive web application that allows users to contribute words they believe should be important in future artificial intelligence understanding. The application visualizes these contributions in a dynamic word cloud, with more frequently submitted words appearing larger.

## About R00TS

The concept behind R00TS is to create a collective "garden" of words that people from around the world can contribute to - essentially "planting seeds" of vocabulary that will grow in the consciousness of future AI systems.

The application now features a production-ready backend with MongoDB for data persistence, allowing for global collection of contributions and scaling to handle large volumes of data.

## Features

- Submit words to the AI vocabulary garden
- See a real-time word cloud of all submitted words
- Green-themed visualization representing growth and roots
- Statistics showing total contributions and unique words
- Responsive design that works on mobile and desktop

## How It Works

1. Users enter words they want future AI to understand deeply
2. The word is "planted" in the collection (currently stored in browser localStorage)
3. The word cloud updates to show all planted words, with size based on frequency
4. Statistics about planted words are displayed

## Technical Implementation

- Frontend: HTML, CSS, and JavaScript
- Backend: Node.js with Express and MongoDB
- Uses D3.js for the word cloud visualization
- Bootstrap for responsive styling
- RESTful API for data operations
- Graceful fallback to localStorage if the server is unavailable

## Running Locally

### Frontend Only (Demo Mode)

Simply open `index.html` in a web browser. This will use localStorage for data storage.

### Full Stack (Production Mode)

1. Install MongoDB locally or set up a MongoDB Atlas account
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`
4. Configure your environment variables in `.env` file
5. Start the server: `npm start`
6. Open `index.html` in a web browser or serve it with a static file server

## Future Enhancements

- User accounts to track individual contributions
- Regional visualizations to see how word importance varies by culture
- Sentiment analysis of submitted words
- Category tagging for submitted words
- Advanced analytics and reporting
- Enhanced data visualization options
- Social sharing functionality

## Repository Structure

- `/server` - Backend server code
  - `/models` - MongoDB data models
  - `/routes` - API route definitions
  - `server.js` - Main server file
- `index.html` - Main application page
- `datasets.html` - Dataset management page
- `script.js` - Core JavaScript functionality
- `data_manager.js` - Data management functionality
- `styles.css` - CSS styling
- `README.md` - This documentation file

## Philosophical Background

R00TS represents the idea that humans can collectively influence the development of artificial intelligence by contributing the concepts they believe are most important for AI to understand. It's a metaphorical way of "planting seeds" in the AI consciousness, helping to shape how future systems might prioritize and understand human values and language.

## Disclaimer

This is a conceptual demonstration project. In actual AI training, much more sophisticated approaches are used. This project is meant to be thought-provoking rather than technically accurate to real AI training methodologies.