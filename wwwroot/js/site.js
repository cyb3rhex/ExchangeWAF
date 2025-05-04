// Exchange WAF Site JavaScript

// Initialize tooltips and popovers when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Add active class to current nav item
    highlightCurrentNavItem();
});

// Highlight the current navigation item based on the URL
function highlightCurrentNavItem() {
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href').toLowerCase();
        if (href === currentPath || 
            (href !== '/' && currentPath.startsWith(href))) {
            link.classList.add('active');
        }
    });
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format date to local string
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Format time ago (e.g., "2 hours ago")
function timeAgo(dateStr) {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return interval + ' years ago';
    if (interval === 1) return '1 year ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + ' months ago';
    if (interval === 1) return '1 month ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return interval + ' days ago';
    if (interval === 1) return '1 day ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return interval + ' hours ago';
    if (interval === 1) return '1 hour ago';
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + ' minutes ago';
    if (interval === 1) return '1 minute ago';
    
    if (seconds < 10) return 'just now';
    return Math.floor(seconds) + ' seconds ago';
}

// Create a chart for attack types
function createAttackTypeChart(elementId, data) {
    const ctx = document.getElementById(elementId).getContext('2d');
    
    // Set default colors for attack types
    const colors = {
        'XSS': 'rgba(255, 99, 132, 0.8)',
        'SQL Injection': 'rgba(54, 162, 235, 0.8)',
        'Command Injection': 'rgba(255, 206, 86, 0.8)',
        'Path Traversal': 'rgba(75, 192, 192, 0.8)',
        'Custom': 'rgba(153, 102, 255, 0.8)',
        'Unknown': 'rgba(201, 203, 207, 0.8)'
    };
    
    const backgroundColors = Object.values(data).map((_, index) => 
        Object.values(colors)[index % Object.values(colors).length]
    );
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create a time series chart for blocked requests
function createTimeSeriesChart(elementId, data) {
    const ctx = document.getElementById(elementId).getContext('2d');
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Blocked Requests',
                data: data.values,
                fill: true,
                backgroundColor: 'rgba(0, 120, 212, 0.1)',
                borderColor: 'rgba(0, 120, 212, 1)',
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: 'rgba(0, 120, 212, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

// Display a notification
function showNotification(message, type = 'info') {
    // Map type to Bootstrap alert class
    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info'
    }[type] || 'alert-info';
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert ${alertClass} alert-dismissible fade show notification-toast`;
    notification.role = 'alert';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container (create if doesn't exist)
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 150);
    }, 5000);
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(
        function() {
            showNotification('Copied to clipboard!', 'success');
        },
        function(err) {
            console.error('Could not copy text: ', err);
            showNotification('Failed to copy to clipboard', 'error');
        }
    );
}

// Format IP address for display
function formatIp(ip) {
    // If IPv6, format with brackets
    if (ip.includes(':')) {
        return `[${ip}]`;
    }
    return ip;
}

// Confirm dialog with promise
function confirmAction(message, confirmText = 'Confirm', cancelText = 'Cancel') {
    return new Promise((resolve) => {
        if (confirm(message)) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

// Format rule type as string
function formatRuleType(typeCode) {
    const types = {
        0: 'XSS',
        1: 'SQL Injection',
        2: 'Command Injection',
        3: 'Path Traversal',
        99: 'Custom'
    };
    
    return types[typeCode] || 'Unknown';
}

// Format severity level
function formatSeverity(level) {
    const levels = {
        1: 'Low',
        2: 'Medium',
        3: 'High'
    };
    
    return levels[level] || 'Unknown';
}

// Create severity indicator HTML
function createSeverityIndicator(level) {
    let html = '';
    
    for (let i = 0; i < level; i++) {
        html += '<i class="fas fa-exclamation-triangle text-warning"></i> ';
    }
    
    return html;
}

// Handle API errors
function handleApiError(error, defaultMessage = 'An error occurred.') {
    console.error('API Error:', error);
    
    let errorMessage = defaultMessage;
    if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
    }
    
    showNotification(errorMessage, 'error');
}

// Toggle loading state for a button
function toggleButtonLoading(button, isLoading) {
    if (isLoading) {
        button.setAttribute('disabled', 'disabled');
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    } else {
        button.removeAttribute('disabled');
        button.innerHTML = button.dataset.originalText;
    }
} 