const express = require('express');
const router = express.Router();
const Dataset = require('../models/Dataset');
const Word = require('../models/Word');

// Get all datasets (limited info)
router.get('/', async (req, res) => {
  try {
    const datasets = await Dataset.find().select('-data').sort({ timestamp: -1 });
    res.json(datasets);
  } catch (err) {
    console.error('Error fetching datasets:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific dataset by filename
router.get('/:filename', async (req, res) => {
  try {
    const dataset = await Dataset.findOne({ filename: req.params.filename });
    
    if (!dataset) {
      return res.status(404).json({ message: 'Dataset not found' });
    }
    
    res.json(dataset);
  } catch (err) {
    console.error('Error fetching dataset:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new dataset snapshot
router.post('/', async (req, res) => {
  try {
    // Get all words from the database
    const words = await Word.find();
    
    // Format data to match the existing structure
    const formattedWords = {};
    words.forEach(word => {
      formattedWords[word.word] = word.count;
    });
    
    // Calculate stats
    const wordCount = words.length;
    const totalSubmissions = words.reduce((sum, word) => sum + word.count, 0);
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `roots_dataset_${timestamp}.json`;
    
    // Create new dataset
    const newDataset = new Dataset({
      filename,
      timestamp: new Date(),
      wordCount,
      totalSubmissions,
      data: formattedWords
    });
    
    await newDataset.save();
    
    res.status(201).json(newDataset);
  } catch (err) {
    console.error('Error creating dataset:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent datasets (limited to 5)
router.get('/recent/list', async (req, res) => {
  try {
    const datasets = await Dataset.find()
      .select('-data')
      .sort({ timestamp: -1 })
      .limit(5);
    
    res.json(datasets);
  } catch (err) {
    console.error('Error fetching recent datasets:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
