// Admin Panel JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize file upload drag and drop
    initializeFileUpload();
    
    // Add loading states to forms
    addFormLoadingStates();
    
    // Add fade-in animation to cards
    addFadeInAnimations();
});

// File Upload with Drag and Drop
function initializeFileUpload() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        const formGroup = input.closest('.mb-3');
        if (!formGroup) return;
        
        // Create drag and drop area
        const dragArea = document.createElement('div');
        dragArea.className = 'upload-area';
        dragArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt fa-3x mb-3 text-muted"></i>
            <p class="mb-0">Drag and drop files here or click to browse</p>
            <small class="text-muted">Supported formats: ${input.accept}</small>
        `;
        
        // Insert drag area after the file input
        input.style.display = 'none';
        formGroup.appendChild(dragArea);
        
        // Handle drag and drop events
        dragArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        dragArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        dragArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                input.files = files;
                updateFileDisplay(this, files[0]);
            }
        });
        
        dragArea.addEventListener('click', function() {
            input.click();
        });
        
        input.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                updateFileDisplay(dragArea, e.target.files[0]);
            }
        });
    });
}

function updateFileDisplay(dragArea, file) {
    const fileIcon = getFileIcon(file.type);
    dragArea.innerHTML = `
        <i class="fas fa-${fileIcon} fa-3x mb-3 text-success"></i>
        <p class="mb-0 fw-bold">${file.name}</p>
        <small class="text-muted">${formatFileSize(file.size)}</small>
        <br>
        <small class="text-success">
            <i class="fas fa-check me-1"></i>File selected
        </small>
    `;
}

function getFileIcon(fileType) {
    if (fileType.includes('pdf')) return 'file-pdf';
    if (fileType.includes('word') || fileType.includes('docx')) return 'file-word';
    if (fileType.includes('audio') || fileType.includes('mp3') || fileType.includes('wav')) return 'file-audio';
    return 'file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Form Loading States
function addFormLoadingStates() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
                submitBtn.disabled = true;
                
                // Re-enable button after 30 seconds as fallback
                setTimeout(() => {
                    if (submitBtn.disabled) {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                }, 30000);
            }
        });
    });
}

// Fade-in Animations
function addFadeInAnimations() {
    const cards = document.querySelectorAll('.card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });
    
    cards.forEach(card => {
        observer.observe(card);
    });
}

// Utility Functions
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert">
            <div class="toast-header">
                <i class="fas fa-${getToastIcon(type)} me-2 text-${type}"></i>
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Search and Filter Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Live search functionality
const searchInputs = document.querySelectorAll('input[name="search"]');
searchInputs.forEach(input => {
    input.addEventListener('input', debounce(function(e) {
        // Auto-submit form after user stops typing
        if (e.target.value.length > 2 || e.target.value.length === 0) {
            e.target.closest('form').submit();
        }
    }, 500));
});

// Confirmation dialogs
function confirmDelete(message = 'Are you sure you want to delete this item?') {
    return confirm(message);
}

// File download helper
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Progress bar for uploads
function showUploadProgress(form, progressPercent) {
    let progressBar = form.querySelector('.upload-progress');
    
    if (!progressBar) {
        const progressHtml = `
            <div class="upload-progress mt-3">
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                </div>
                <small class="text-muted mt-1 d-block">Uploading...</small>
            </div>
        `;
        form.insertAdjacentHTML('beforeend', progressHtml);
        progressBar = form.querySelector('.upload-progress');
    }
    
    const bar = progressBar.querySelector('.progress-bar');
    const text = progressBar.querySelector('small');
    
    bar.style.width = progressPercent + '%';
    text.textContent = `Uploading... ${progressPercent}%`;
    
    if (progressPercent >= 100) {
        text.textContent = 'Processing...';
    }
}

function hideUploadProgress(form) {
    const progressBar = form.querySelector('.upload-progress');
    if (progressBar) {
        progressBar.remove();
    }
}

// Enhanced fetch with progress
async function uploadWithProgress(url, formData, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const percentComplete = (e.loaded / e.total) * 100;
                onProgress(percentComplete);
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (e) {
                    resolve(xhr.responseText);
                }
            } else {
                reject(new Error('Upload failed'));
            }
        });
        
        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
        });
        
        xhr.open('POST', url);
        xhr.send(formData);
    });
}

// Auto-save functionality for forms
function enableAutoSave(form, saveUrl, interval = 30000) {
    let saveTimeout;
    let hasChanges = false;
    
    // Track changes
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            hasChanges = true;
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                if (hasChanges) {
                    autoSave(form, saveUrl);
                }
            }, interval);
        });
    });
}

async function autoSave(form, saveUrl) {
    try {
        const formData = new FormData(form);
        const response = await fetch(saveUrl, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showToast('Changes saved automatically', 'success');
        }
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const activeForm = document.querySelector('form:focus-within');
        if (activeForm) {
            const submitBtn = activeForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            const modal = bootstrap.Modal.getInstance(openModal);
            if (modal) {
                modal.hide();
            }
        }
    }
});

// Theme switcher (if needed)
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

// Export functions for use in other scripts
window.AdminJS = {
    showToast,
    confirmDelete,
    downloadFile,
    uploadWithProgress,
    showUploadProgress,
    hideUploadProgress,
    formatFileSize,
    toggleTheme
};