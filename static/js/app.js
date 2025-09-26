/**
 * Wind Project Admin - JavaScript Application
 */

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize file upload handlers
    initializeFileUpload();
    
    // Initialize form validations
    initializeFormValidation();
    
    // Initialize auto-dismiss alerts
    initializeAlerts();
    
    // Add fade-in animation to cards
    addFadeInAnimation();
}

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Initialize file upload functionality
 */
function initializeFileUpload() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(function(input) {
        input.addEventListener('change', function(e) {
            handleFileSelection(e.target);
        });
    });
    
    // Initialize drag and drop (if supported)
    initializeDragAndDrop();
}

/**
 * Handle file selection and validation
 */
function handleFileSelection(input) {
    const file = input.files[0];
    if (!file) return;
    
    // Get the upload type from the form
    const form = input.closest('form');
    const uploadType = form ? form.querySelector('input[name="upload_type"]')?.value : '';
    
    // Validate file size (500MB limit)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (file.size > maxSize) {
        showAlert('File is too large. Maximum size is 500MB.', 'error');
        input.value = '';
        return;
    }
    
    // Validate file type
    if (!validateFileType(file, uploadType)) {
        const allowedTypes = uploadType === 'manuscript' ? 'PDF, DOC, DOCX' : 'MP3, WAV, FLAC, M4A';
        showAlert(`Invalid file type. Allowed types: ${allowedTypes}`, 'error');
        input.value = '';
        return;
    }
    
    // Show file info
    displayFileInfo(file, input);
}

/**
 * Validate file type based on upload type
 */
function validateFileType(file, uploadType) {
    const manuscriptTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/mp4', 'audio/x-m4a'];
    
    if (uploadType === 'manuscript') {
        return manuscriptTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx)$/i);
    } else if (uploadType === 'audio') {
        return audioTypes.includes(file.type) || file.name.match(/\.(mp3|wav|flac|m4a)$/i);
    }
    
    return false;
}

/**
 * Display file information
 */
function displayFileInfo(file, input) {
    // Remove existing file info
    const existingInfo = input.parentNode.querySelector('.file-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    // Create file info element
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info mt-2 p-2 bg-light rounded';
    fileInfo.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-file-earmark text-primary me-2"></i>
            <div class="flex-grow-1">
                <div class="fw-semibold">${file.name}</div>
                <small class="text-muted">${formatFileSize(file.size)}</small>
            </div>
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="clearFileSelection(this)">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    
    // Insert after the input
    input.parentNode.insertBefore(fileInfo, input.nextSibling);
}

/**
 * Clear file selection
 */
function clearFileSelection(button) {
    const fileInfo = button.closest('.file-info');
    const input = fileInfo.previousElementSibling;
    
    input.value = '';
    fileInfo.remove();
}

/**
 * Initialize drag and drop functionality
 */
function initializeDragAndDrop() {
    const dropZones = document.querySelectorAll('.upload-form');
    
    dropZones.forEach(function(zone) {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

/**
 * Handle drag over event
 */
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

/**
 * Handle file drop
 */
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const fileInput = e.currentTarget.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.files = files;
            handleFileSelection(fileInput);
        }
    }
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('form[enctype="multipart/form-data"]');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
                return false;
            }
            
            // Show loading state
            showLoadingState(form);
        });
    });
}

/**
 * Validate form before submission
 */
function validateForm(form) {
    const fileInput = form.querySelector('input[type="file"]');
    const titleInput = form.querySelector('input[name="title"]');
    const authorOrNarratorInput = form.querySelector('input[name="author"], input[name="narrator"]');
    
    // Check if file is selected
    if (!fileInput || !fileInput.files.length) {
        showAlert('Please select a file to upload.', 'error');
        return false;
    }
    
    // Check required fields
    if (!titleInput || !titleInput.value.trim()) {
        showAlert('Please enter a title.', 'error');
        titleInput?.focus();
        return false;
    }
    
    if (!authorOrNarratorInput || !authorOrNarratorInput.value.trim()) {
        const fieldName = authorOrNarratorInput?.name === 'author' ? 'author' : 'narrator';
        showAlert(`Please enter a ${fieldName}.`, 'error');
        authorOrNarratorInput?.focus();
        return false;
    }
    
    return true;
}

/**
 * Show loading state on form submission
 */
function showLoadingState(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Uploading...';
        submitButton.disabled = true;
        
        // Store original text for potential restoration
        submitButton.setAttribute('data-original-text', originalText);
    }
}

/**
 * Initialize auto-dismiss alerts
 */
function initializeAlerts() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(function(alert) {
        // Auto-dismiss after 5 seconds for success messages
        if (alert.classList.contains('alert-success')) {
            setTimeout(function() {
                const alertInstance = bootstrap.Alert.getOrCreateInstance(alert);
                alertInstance.close();
            }, 5000);
        }
    });
}

/**
 * Show alert message
 */
function showAlert(message, type) {
    const alertContainer = document.querySelector('.container');
    const alertElement = document.createElement('div');
    
    const alertClass = type === 'error' ? 'alert-danger' : `alert-${type}`;
    const iconClass = type === 'error' ? 'bi-exclamation-triangle' : 
                     type === 'success' ? 'bi-check-circle' : 
                     type === 'info' ? 'bi-info-circle' : 'bi-exclamation-circle';
    
    alertElement.className = `alert ${alertClass} alert-dismissible fade show`;
    alertElement.innerHTML = `
        <i class="bi ${iconClass}"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the container
    alertContainer.insertBefore(alertElement, alertContainer.firstChild);
    
    // Auto-dismiss after 5 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(function() {
            const alertInstance = bootstrap.Alert.getOrCreateInstance(alertElement);
            alertInstance.close();
        }, 5000);
    }
}

/**
 * Add fade-in animation to cards
 */
function addFadeInAnimation() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(function(card, index) {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        return new Promise((resolve, reject) => {
            try {
                document.execCommand('copy');
                textArea.remove();
                resolve();
            } catch (error) {
                textArea.remove();
                reject(error);
            }
        });
    }
}

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}