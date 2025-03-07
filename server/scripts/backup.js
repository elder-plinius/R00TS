/**
 * R00TS Automated Database Backup Script
 * This script creates backups of the MongoDB database and manages backup rotation
 */

require('dotenv').config({ path: '../.env' });
const backup = require('mongodb-backup');
const fs = require('fs');
const path = require('path');
const { CronJob } = require('cron');

// Create backups directory if it doesn't exist
const backupDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`Created backups directory at ${backupDir}`);
}

/**
 * Perform MongoDB backup
 */
function performBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${timestamp}`);
  
  console.log(`Starting backup at ${new Date().toLocaleString()}...`);
  
  backup({
    uri: process.env.MONGODB_URI,
    root: backupPath,
    callback: function(err) {
      if (err) {
        console.error('Backup failed:', err);
      } else {
        console.log(`Backup completed successfully at ${backupPath}`);
        // Rotate backups (keep only the last 7 backups)
        rotateBackups();
      }
    }
  });
}

/**
 * Rotate backups to keep only the most recent ones
 */
function rotateBackups() {
  fs.readdir(backupDir, (err, files) => {
    if (err) {
      console.error('Error reading backup directory:', err);
      return;
    }
    
    // Sort files by creation time (oldest first)
    const sortedFiles = files.map(file => ({
      name: file,
      path: path.join(backupDir, file),
      time: fs.statSync(path.join(backupDir, file)).birthtime
    })).sort((a, b) => a.time - b.time);
    
    // Keep only the 7 most recent backups
    const MAX_BACKUPS = 7;
    if (sortedFiles.length > MAX_BACKUPS) {
      const filesToDelete = sortedFiles.slice(0, sortedFiles.length - MAX_BACKUPS);
      filesToDelete.forEach(file => {
        fs.rm(file.path, { recursive: true, force: true }, (err) => {
          if (err) {
            console.error(`Error deleting old backup ${file.name}:`, err);
          } else {
            console.log(`Deleted old backup: ${file.name}`);
          }
        });
      });
    }
  });
}

// If this script is run directly, perform a backup immediately
if (require.main === module) {
  performBackup();
}

// Schedule automatic backups (daily at 3:00 AM)
const backupJob = new CronJob('0 3 * * *', performBackup, null, true);

module.exports = { performBackup, backupJob };
