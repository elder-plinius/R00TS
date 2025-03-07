const express = require('express');
const router = express.Router();
const Word = require('../models/Word');

// Get all words
router.get('/', async (req, res) => {
  try {
    const words = await Word.find();
    
    // Format data to match the existing structure
    const formattedWords = {};
    words.forEach(word => {
      formattedWords[word.word] = word.count;
    });
    
    res.json(formattedWords);
  } catch (err) {
    console.error('Error fetching words:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add or update a word
router.post('/', async (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word || typeof word !== 'string') {
      return res.status(400).json({ message: 'Word is required and must be a string' });
    }
    
    const normalizedWord = word.trim().toLowerCase();
    
    // Find and update if exists, or create new
    const updatedWord = await Word.findOneAndUpdate(
      { word: normalizedWord },
      { $inc: { count: 1 }, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    
    res.json(updatedWord);
  } catch (err) {
    console.error('Error adding word:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const totalWords = await Word.countDocuments();
    const totalSubmissions = await Word.aggregate([
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    
    res.json({
      uniqueWords: totalWords,
      totalSubmissions: totalSubmissions.length > 0 ? totalSubmissions[0].total : 0
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
