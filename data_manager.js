// R00TS - Data Management System
class DataManager {
    constructor(backupInterval = 1800000) { // Default: 30 minutes
        this.backupInterval = backupInterval;
        this.apiBaseUrl = '/api';
        this.startAutoBackup();
    }

    async getCurrentWords() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/words`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching words:', error);
            // Fallback to localStorage if API fails
            return JSON.parse(localStorage.getItem('roots-words') || '{}');
        }
    }

    async addWord(word) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/words`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding word:', error);
            // Fallback to localStorage if API fails
            const words = JSON.parse(localStorage.getItem('roots-words') || '{}');
            words[word] = (words[word] || 0) + 1;
            localStorage.setItem('roots-words', JSON.stringify(words));
            return { word, count: words[word] };
        }
    }

    async saveDataset() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const dataset = await response.json();
            console.log(`Dataset saved: ${dataset.filename}`);
            this.updateDatasetDisplay();
            return dataset;
        } catch (error) {
            console.error('Error saving dataset:', error);
            // Fallback to the old method if API fails
            const currentData = await this.getCurrentWords();
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
            
            console.log(`Dataset saved locally: ${filename}`);
            this.updateLocalDatasetList(filename, currentData);
        }
    }

    updateLocalDatasetList(filename, data) {
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

    async updateDatasetDisplay() {
        const datasetList = document.getElementById('dataset-list');
        if (!datasetList) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/datasets/recent/list`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const datasets = await response.json();
            datasetList.innerHTML = datasets.slice(0, 5).map(dataset => `
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
        } catch (error) {
            console.error('Error fetching datasets:', error);
            // Fallback to localStorage
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
    console.log('R00TS Data Manager initialized with production-ready backend');
});
