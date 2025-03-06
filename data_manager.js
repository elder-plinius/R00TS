// R00TS - Data Management System
class DataManager {
    constructor(backupInterval = 1800000) { // Default: 30 minutes
        this.backupInterval = backupInterval;
        this.dataDir = 'datasets';
        this.initializeDataDirectory();
        this.startAutoBackup();
    }

    async initializeDataDirectory() {
        try {
            const response = await fetch(`/${this.dataDir}`);
            if (response.status === 404) {
                console.log('Creating datasets directory...');
                // Directory will be created on first backup
            }
        } catch (error) {
            console.log('Will create datasets directory on first backup');
        }
    }

    getCurrentWords() {
        return JSON.parse(localStorage.getItem('roots-words')) || {};
    }

    async saveDataset() {
        const currentData = this.getCurrentWords();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `roots_dataset_${timestamp}.json`;
        
        const dataBlob = new Blob(
            [JSON.stringify(currentData, null, 2)], 
            { type: 'application/json' }
        );
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(link.href);
        
        console.log(`Dataset saved: ${filename}`);
        this.updateDatasetList(filename, currentData);
    }

    updateDatasetList(filename, data) {
        const datasets = JSON.parse(localStorage.getItem('roots-datasets') || '[]');
        datasets.push({
            filename,
            timestamp: new Date().toISOString(),
            wordCount: Object.keys(data).length,
            totalSubmissions: Object.values(data).reduce((a, b) => a + b, 0)
        });
        
        // Keep only last 50 datasets in the list
        if (datasets.length > 50) {
            datasets.shift();
        }
        
        localStorage.setItem('roots-datasets', JSON.stringify(datasets));
        this.updateDatasetDisplay();
    }

    updateDatasetDisplay() {
        const datasetList = document.getElementById('dataset-list');
        if (!datasetList) return;

        const datasets = JSON.parse(localStorage.getItem('roots-datasets') || '[]');
        datasetList.innerHTML = datasets.reverse().slice(0, 5).map(dataset => `
            <div class="dataset-item">
                <div class="dataset-info">
                    <span class="dataset-name">${dataset.filename}</span>
                    <span class="dataset-stats">
                        Words: ${dataset.wordCount} | 
                        Submissions: ${dataset.totalSubmissions}
                    </span>
                </div>
                <div class="dataset-time">
                    ${new Date(dataset.timestamp).toLocaleString()}
                </div>
            </div>
        `).join('');
    }

    startAutoBackup() {
        // Initial backup
        setTimeout(() => this.saveDataset(), 5000);
        
        // Regular backups
        setInterval(() => this.saveDataset(), this.backupInterval);
    }
}

// Initialize data manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dataManager = new DataManager();
});
