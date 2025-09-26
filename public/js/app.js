// Main application JavaScript
class EBookStore {
    constructor() {
        this.currentUser = null;
        this.currentPage = 1;
        this.booksPerPage = 12;
        this.currentFilters = {};
        
        this.init();
    }

    init() {
        this.loadUserFromStorage();
        this.updateNavigation();
        this.setupEventListeners();
        this.loadBooks();
        this.loadSubscriptions();
    }

    // User Management
    loadUserFromStorage() {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            this.currentUser = JSON.parse(userData);
            this.authToken = token;
        }
    }

    updateNavigation() {
        const navAuth = document.getElementById('nav-auth');
        const navUser = document.getElementById('nav-user');
        const userName = document.getElementById('user-name');
        const dashboardLink = document.getElementById('dashboard-link');

        if (this.currentUser) {
            if (navAuth) navAuth.style.display = 'none';
            if (navUser) navUser.style.display = 'block';
            if (userName) userName.textContent = this.currentUser.username;
            
            // Set dashboard link based on user role
            if (dashboardLink) {
                if (this.currentUser.role === 'author') {
                    dashboardLink.href = '/author';
                    dashboardLink.innerHTML = '<i class="fas fa-pen-fancy"></i> Author Dashboard';
                } else {
                    dashboardLink.href = '/reader';
                    dashboardLink.innerHTML = '<i class="fas fa-book-reader"></i> Reader Dashboard';
                }
            }
        } else {
            if (navAuth) navAuth.style.display = 'flex';
            if (navUser) navUser.style.display = 'none';
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        this.currentUser = null;
        this.authToken = null;
        this.updateNavigation();
        showToast('Logged out successfully', 'success');
        
        // Redirect to home if on dashboard pages
        if (window.location.pathname.includes('author') || window.location.pathname.includes('reader')) {
            window.location.href = '/';
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        const userBtn = document.getElementById('user-btn');
        const logoutLink = document.getElementById('logout-link');
        
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Search and filters
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        const genreFilter = document.getElementById('genre-filter');
        const audiobookFilter = document.getElementById('audiobook-filter');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchBooks());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchBooks();
                }
            });
        }

        if (genreFilter) {
            genreFilter.addEventListener('change', () => this.filterBooks());
        }

        if (audiobookFilter) {
            audiobookFilter.addEventListener('change', () => this.filterBooks());
        }

        // Modal close buttons
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    // Book Management
    async loadBooks(page = 1) {
        try {
            showSpinner(true);
            
            const params = new URLSearchParams({
                page: page,
                limit: this.booksPerPage,
                ...this.currentFilters
            });

            const response = await fetch(`/api/books?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.displayBooks(data.books);
                this.displayPagination(data.pagination);
            } else {
                throw new Error(data.error || 'Failed to load books');
            }
        } catch (error) {
            console.error('Error loading books:', error);
            showToast('Failed to load books', 'error');
        } finally {
            showSpinner(false);
        }
    }

    displayBooks(books) {
        const booksGrid = document.getElementById('books-grid');
        if (!booksGrid) return;

        if (books.length === 0) {
            booksGrid.innerHTML = `
                <div class="no-books">
                    <i class="fas fa-book-open"></i>
                    <h3>No books found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        booksGrid.innerHTML = books.map(book => `
            <div class="book-card" onclick="app.showBookDetails(${book.id})">
                <div class="book-cover">
                    ${book.cover_image ? 
                        `<img src="/uploads/covers/${book.cover_image}" alt="${book.title}">` :
                        `<i class="fas fa-book" style="font-size: 3rem; color: #ccc;"></i>`
                    }
                </div>
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">by ${book.author_name}</div>
                    ${book.genre ? `<div class="book-genre">${book.genre}</div>` : ''}
                    <div class="book-price">
                        ${book.is_free ? 'Free' : `$${book.price}`}
                        ${book.has_audiobook ? '<i class="fas fa-headphones" title="Audiobook available"></i>' : ''}
                    </div>
                </div>
                <div class="book-actions">
                    ${this.currentUser ? 
                        `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); app.addToLibrary(${book.id})">
                            <i class="fas fa-plus"></i> Add to Library
                         </button>` :
                        `<a href="/login" class="btn btn-primary btn-sm">Login to Add</a>`
                    }
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); app.showBookDetails(${book.id})">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    displayPagination(pagination) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        if (pagination.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-controls">';
        
        if (pagination.hasPrev) {
            paginationHTML += `<button class="btn btn-secondary btn-sm" onclick="app.loadBooks(${pagination.currentPage - 1})">
                <i class="fas fa-chevron-left"></i> Previous
            </button>`;
        }

        paginationHTML += `<span class="pagination-info">
            Page ${pagination.currentPage} of ${pagination.totalPages}
        </span>`;

        if (pagination.hasNext) {
            paginationHTML += `<button class="btn btn-secondary btn-sm" onclick="app.loadBooks(${pagination.currentPage + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>`;
        }

        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;
    }

    searchBooks() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            this.currentFilters.search = searchInput.value.trim();
        }
        this.currentPage = 1;
        this.loadBooks(1);
    }

    filterBooks() {
        const genreFilter = document.getElementById('genre-filter');
        const audiobookFilter = document.getElementById('audiobook-filter');

        this.currentFilters = {};
        
        if (genreFilter && genreFilter.value) {
            this.currentFilters.genre = genreFilter.value;
        }
        
        if (audiobookFilter && audiobookFilter.checked) {
            this.currentFilters.has_audiobook = 'true';
        }

        const searchInput = document.getElementById('search-input');
        if (searchInput && searchInput.value.trim()) {
            this.currentFilters.search = searchInput.value.trim();
        }

        this.currentPage = 1;
        this.loadBooks(1);
    }

    async showBookDetails(bookId) {
        try {
            showSpinner(true);
            
            const response = await fetch(`/api/books/${bookId}`);
            const data = await response.json();

            if (response.ok) {
                this.displayBookModal(data.book);
            } else {
                throw new Error(data.error || 'Failed to load book details');
            }
        } catch (error) {
            console.error('Error loading book details:', error);
            showToast('Failed to load book details', 'error');
        } finally {
            showSpinner(false);
        }
    }

    displayBookModal(book) {
        const modal = document.getElementById('book-modal');
        const bookDetails = document.getElementById('book-details');

        if (!modal || !bookDetails) return;

        bookDetails.innerHTML = `
            <div class="book-modal-content">
                <div class="book-modal-header">
                    <div class="book-modal-cover">
                        ${book.cover_image ? 
                            `<img src="/uploads/covers/${book.cover_image}" alt="${book.title}">` :
                            `<div class="placeholder-cover"><i class="fas fa-book"></i></div>`
                        }
                    </div>
                    <div class="book-modal-info">
                        <h2>${book.title}</h2>
                        <p class="author">by ${book.author_name}</p>
                        ${book.genre ? `<p class="genre">${book.genre}</p>` : ''}
                        ${book.isbn ? `<p class="isbn">ISBN: ${book.isbn}</p>` : ''}
                        <p class="price">${book.is_free ? 'Free' : `$${book.price}`}</p>
                        ${book.published_date ? `<p class="published">Published: ${new Date(book.published_date).toLocaleDateString()}</p>` : ''}
                        ${book.has_audiobook ? '<p class="audiobook"><i class="fas fa-headphones"></i> Audiobook Available</p>' : ''}
                    </div>
                </div>
                <div class="book-modal-description">
                    <h3>Description</h3>
                    <p>${book.description}</p>
                </div>
                <div class="book-modal-actions">
                    ${this.currentUser ? 
                        `<button class="btn btn-primary" onclick="app.addToLibrary(${book.id})">
                            <i class="fas fa-plus"></i> Add to Library
                         </button>
                         ${book.has_audiobook ? 
                            `<button class="btn btn-secondary" onclick="app.addToLibrary(${book.id}, 'audiobook')">
                                <i class="fas fa-headphones"></i> Add Audiobook
                             </button>` : ''
                         }` :
                        `<a href="/login" class="btn btn-primary">Login to Add to Library</a>`
                    }
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    async addToLibrary(bookId, type = 'ebook') {
        if (!this.currentUser) {
            showToast('Please login to add books to your library', 'warning');
            return;
        }

        try {
            showSpinner(true);
            
            const response = await fetch(`/api/books/${bookId}/access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    access_type: 'subscription'
                })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Book added to your library!', 'success');
            } else {
                throw new Error(data.error || 'Failed to add book to library');
            }
        } catch (error) {
            console.error('Error adding book to library:', error);
            showToast(error.message, 'error');
        } finally {
            showSpinner(false);
        }
    }

    // Subscription Management
    async loadSubscriptions() {
        try {
            const response = await fetch('/api/subscriptions');
            const data = await response.json();

            if (response.ok) {
                this.displaySubscriptions(data.subscriptions);
            } else {
                throw new Error(data.error || 'Failed to load subscriptions');
            }
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        }
    }

    displaySubscriptions(subscriptions) {
        const subscriptionCards = document.getElementById('subscription-cards');
        if (!subscriptionCards) return;

        subscriptionCards.innerHTML = subscriptions.map((sub, index) => `
            <div class="subscription-card ${index === 1 ? 'featured' : ''}">
                <div class="subscription-name">${sub.name}</div>
                <div class="subscription-price">$${sub.price}</div>
                <div class="subscription-period">
                    ${sub.duration_months === 0 ? 'Forever' : `per ${sub.duration_months} month${sub.duration_months > 1 ? 's' : ''}`}
                </div>
                <div class="subscription-description">${sub.description}</div>
                <ul class="subscription-features">
                    ${sub.features ? sub.features.split(',').map(feature => 
                        `<li><i class="fas fa-check"></i> ${feature.trim()}</li>`
                    ).join('') : ''}
                </ul>
                ${this.currentUser ? 
                    `<button class="btn btn-primary" onclick="app.subscribe(${sub.id})">
                        ${this.currentUser.subscription_type === sub.name.toLowerCase() ? 'Current Plan' : 'Choose Plan'}
                     </button>` :
                    `<a href="/login" class="btn btn-primary">Login to Subscribe</a>`
                }
            </div>
        `).join('');
    }

    async subscribe(subscriptionId) {
        if (!this.currentUser) {
            showToast('Please login to subscribe', 'warning');
            return;
        }

        if (!confirm('Are you sure you want to change your subscription plan?')) {
            return;
        }

        try {
            showSpinner(true);
            
            const response = await fetch(`/api/subscriptions/${subscriptionId}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Subscription updated successfully!', 'success');
                
                // Update user data
                this.currentUser.subscription_type = data.subscription.type;
                this.currentUser.subscription_expires = data.subscription.expires;
                localStorage.setItem('userData', JSON.stringify(this.currentUser));
                
                // Reload subscriptions to update UI
                this.loadSubscriptions();
            } else {
                throw new Error(data.error || 'Failed to update subscription');
            }
        } catch (error) {
            console.error('Error updating subscription:', error);
            showToast(error.message, 'error');
        } finally {
            showSpinner(false);
        }
    }
}

// Utility Functions
function showSpinner(show) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;

    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.style.display = 'none';
    }
}

// Initialize the application
const app = new EBookStore();

// Make functions globally available
window.app = app;
window.showToast = showToast;
window.hideToast = hideToast;