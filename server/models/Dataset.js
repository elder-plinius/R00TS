const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  wordCount: {
    type: Number,
    required: true
  },
  totalSubmissions: {
    type: Number,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
});

module.exports = mongoose.model('Dataset', DatasetSchema);
