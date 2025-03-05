// R00TS - Plant the seeds of artificial intelligence
// Main application functionality

document.addEventListener('DOMContentLoaded', function() {
    // Load words from storage
    loadWords();
    
    // Set up automatic updates
    setInterval(loadWords, 5000);
});

function loadWords() {
    // In a real implementation, this would be an API call
    // For demo purposes, we're using localStorage
    let words = JSON.parse(localStorage.getItem('roots-words')) || {};
    
    // Update the visualization
    updateWordCloud(words);
    
    // Update statistics
    updateStats(words);
}

function updateStats(words) {
    const totalSubmissions = Object.values(words).reduce((a, b) => a + b, 0);
    const uniqueWords = Object.keys(words).length;
    
    document.getElementById('submission-count').textContent = totalSubmissions;
    document.getElementById('unique-count').textContent = uniqueWords;
}

function submitWord(word) {
    word = word.trim().toLowerCase();
    
    if (!word) return false;
    
    // For demo purposes, we're using localStorage
    let words = JSON.parse(localStorage.getItem('roots-words')) || {};
    words[word] = (words[word] || 0) + 1;
    localStorage.setItem('roots-words', JSON.stringify(words));
    
    // Update UI
    loadWords();
    
    return true;
}

function updateWordCloud(words) {
    const container = document.getElementById('word-cloud-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    const wordData = Object.entries(words).map(([text, value]) => ({ text, value }));
    
    // Sort by frequency
    wordData.sort((a, b) => b.value - a.value);
    
    // Take top 100 words
    const topWords = wordData.slice(0, 100);
    
    if (topWords.length === 0) {
        // Show placeholder if no words
        container.innerHTML = '<div class="d-flex justify-content-center align-items-center h-100"><p class="text-muted">Plant some words to see them grow here!</p></div>';
        return;
    }
    
    // Calculate min/max for scaling
    const minCount = Math.min(...topWords.map(d => d.value)) || 1;
    const maxCount = Math.max(...topWords.map(d => d.value)) || 1;
    
    // Create SVG
    const svg = d3.select('#word-cloud-container')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`);
    
    // Create a simple layout
    const fontSize = d => Math.max(16, Math.min(60, 16 + (d.value - minCount) / (maxCount - minCount || 1) * 44));
    
    // Green colors for the plants/roots theme
    const colorScale = d3.scaleLinear()
        .domain([minCount, maxCount])
        .range(['#a8d5ba', '#2d6a4f']);
    
    // Position words in a circular pattern
    let i = 0;
    topWords.forEach(word => {
        const angle = (i / topWords.length) * 2 * Math.PI;
        const radius = Math.min(width, height) * 0.4 * Math.random();
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        svg.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('font-size', `${fontSize(word)}px`)
            .attr('text-anchor', 'middle')
            .attr('fill', colorScale(word.value))
            .attr('class', 'word-item')
            .text(word.text)
            .on('mouseover', function() {
                d3.select(this).attr('font-weight', 'bold');
            })
            .on('mouseout', function() {
                d3.select(this).attr('font-weight', 'normal');
            });
        
        i++;
    });
}

// Function to share words
function shareResults() {
    const words = JSON.parse(localStorage.getItem('roots-words')) || {};
    const totalWords = Object.values(words).reduce((a, b) => a + b, 0);
    const uniqueWords = Object.keys(words).length;
    
    const topWords = Object.entries(words)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word, count]) => word)
        .join(', ');
    
    const shareText = `I've planted ${totalWords} words (${uniqueWords} unique) to help grow the future of AI with R00TS! Top contributions: ${topWords}`;
    
    // In a real implementation, this would integrate with social sharing APIs
    // For demo purposes, we'll just copy to clipboard
    navigator.clipboard.writeText(shareText)
        .then(() => alert('Share text copied to clipboard!'))
        .catch(err => console.error('Failed to copy: ', err));
}