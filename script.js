// R00TS - Plant the seeds of artificial intelligence
// Main application functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles
    initParticles();
    
    // Load words from storage
    loadWords();
    
    // Set up automatic updates
    setInterval(loadWords, 5000);
});

function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#00ff9d'
            },
            shape: {
                type: 'circle'
            },
            opacity: {
                value: 0.5,
                random: true,
                animation: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                animation: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#00ff9d',
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: 'none',
                random: true,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 0.5
                    }
                }
            }
        },
        retina_detect: true
    });
}

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
    
    // Create a particle burst effect
    createParticleBurst();
    
    // For demo purposes, we're using localStorage
    let words = JSON.parse(localStorage.getItem('roots-words')) || {};
    words[word] = (words[word] || 0) + 1;
    localStorage.setItem('roots-words', JSON.stringify(words));
    
    // Update UI with animation
    gsap.to('.stat-box', {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
    });
    
    loadWords();
    return true;
}

function createParticleBurst() {
    const container = document.querySelector('.input-area');
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: #00ff9d;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
        `;
        document.body.appendChild(particle);
        
        const angle = (i / 20) * Math.PI * 2;
        const velocity = 2 + Math.random() * 2;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;
        
        gsap.fromTo(particle,
            {
                x: centerX,
                y: centerY,
                scale: 1,
                opacity: 1
            },
            {
                duration: 1 + Math.random(),
                x: centerX + dx * 50,
                y: centerY + dy * 50,
                scale: 0,
                opacity: 0,
                ease: 'power2.out',
                onComplete: () => particle.remove()
            }
        );
    }
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
        .attr('transform', `translate(${width/2}, ${height * 0.8})`);
    
    // Create tree trunk
    const trunk = svg.append('path')
        .attr('d', `M0,0 L0,-${height * 0.6}`)
        .attr('stroke', '#00ff9d')
        .attr('stroke-width', 8)
        .attr('fill', 'none')
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .style('opacity', 1);
    
    // Create branches function
    function createBranch(startX, startY, length, angle, depth) {
        if (depth <= 0) return;
        
        const endX = startX + length * Math.sin(angle);
        const endY = startY - length * Math.cos(angle);
        
        svg.append('path')
            .attr('d', `M${startX},${startY} L${endX},${endY}`)
            .attr('stroke', '#00ff9d')
            .attr('stroke-width', Math.max(1, depth))
            .attr('fill', 'none')
            .style('opacity', 0)
            .transition()
            .delay(1000 + (5 - depth) * 300)
            .duration(500)
            .style('opacity', 0.5);
        
        createBranch(endX, endY, length * 0.7, angle + 0.5, depth - 1);
        createBranch(endX, endY, length * 0.7, angle - 0.5, depth - 1);
    }
    
    // Create initial branches
    createBranch(0, -height * 0.6, height * 0.2, -Math.PI/4, 5);
    createBranch(0, -height * 0.6, height * 0.2, Math.PI/4, 5);
    
    // Create a force simulation for the words
    const simulation = d3.forceSimulation(topWords)
        .force('charge', d3.forceManyBody().strength(5))
        .force('collide', d3.forceCollide(d => fontSize(d) / 2 + 2))
        .force('x', d3.forceX(d => {
            const angle = (d.index / topWords.length) * Math.PI - Math.PI/2;
            return Math.cos(angle) * (height * 0.3);
        }))
        .force('y', d3.forceY(d => {
            const angle = (d.index / topWords.length) * Math.PI - Math.PI/2;
            return Math.sin(angle) * (height * 0.3) - height * 0.4;
        }));
    
    // Create word elements
    const words = svg.selectAll('.word')
        .data(topWords)
        .enter()
        .append('text')
        .attr('class', 'word')
        .style('fill', d => d3.interpolateGreenYellow(d.value / maxCount))
        .style('font-size', d => `${fontSize(d)}px`)
        .style('font-family', '"Space Grotesk", sans-serif')
        .style('cursor', 'pointer')
        .text(d => d.text)
        .style('opacity', 0)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style('fill', '#39ff14')
                .style('font-size', d => `${fontSize(d) * 1.2}px`)
                .style('text-shadow', '0 0 10px rgba(57, 255, 20, 0.5)');
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style('fill', d3.interpolateGreenYellow(d.value / maxCount))
                .style('font-size', d => `${fontSize(d)}px`)
                .style('text-shadow', 'none');
        });
    
    // Add transition for words appearing
    words.transition()
        .delay((d, i) => 2000 + i * 50)
        .duration(500)
        .style('opacity', 1);
    
    // Update word positions on each tick
    simulation.on('tick', () => {
        words
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle');
    });
}
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