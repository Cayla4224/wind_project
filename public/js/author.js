// Author Dashboard JavaScript
class AuthorDashboard {
    constructor() {
        this.currentUser = null;
        this.authToken = null;
        this.editingBook = null;
        
        this.init();
    }

    init() {
        // Check authentication
        if (!requireAuth()) return;
        
        const user = getCurrentUser();
        if (!hasRole(['author', 'admin'])) {
            showToast('Access denied. Authors only.', 'error');
            setTimeout(() => {
                window.location.href = '/reader';
            }, 2000);
            return;
        }

        this.currentUser = user;
        this.authToken = getAuthToken();
        
        this.updateNavigation();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    updateNavigation() {
        const userName = document.getElementById('user-name');
        if (userName && this.currentUser) {
            userName.textContent = this.currentUser.username;
        }
    }

    setupEventListeners() {
        // Logout
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Book form
        const addBookForm = document.getElementById('add-book-form');
        if (addBookForm) {
            addBookForm.addEventListener('submit', (e) => this.handleBookSubmit(e));
        }

        // Book filter
        const bookFilter = document.getElementById('book-filter');
        if (bookFilter) {
            bookFilter.addEventListener('change', () => this.filterBooks());
        }

        // File upload previews
        const coverInput = document.getElementById('book-cover');
        if (coverInput) {
            coverInput.addEventListener('change', this.previewCoverImage);
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }

    async loadDashboardData() {
        try {
            showSpinner(true);
            
            // Load stats and books in parallel
            await Promise.all([
                this.loadStats(),
                this.loadBooks()
            ]);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showToast('Failed to load dashboard data', 'error');
        } finally {
            showSpinner(false);
        }
    }

    async loadStats() {
        try {
            const response = await fetch(`/api/users/${this.currentUser.id}/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayStats(data.stats);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    displayStats(stats) {
        const totalBooksEl = document.getElementById('total-books');
        const totalAudiobooksEl = document.getElementById('total-audiobooks');
        const totalReadersEl = document.getElementById('total-readers');
        const totalEarningsEl = document.getElementById('total-earnings');

        if (totalBooksEl) totalBooksEl.textContent = stats.authored_books || 0;
        if (totalAudiobooksEl) totalAudiobooksEl.textContent = '0'; // TODO: Calculate audiobooks
        if (totalReadersEl) totalReadersEl.textContent = stats.library_books || 0;
        if (totalEarningsEl) totalEarningsEl.textContent = '$0'; // TODO: Calculate earnings
    }

    async loadBooks() {
        try {
            const response = await fetch(`/api/users/${this.currentUser.id}/books`);
            
            if (response.ok) {
                const data = await response.json();
                this.displayBooks(data.books);
            } else {
                throw new Error('Failed to load books');
            }
        } catch (error) {
            console.error('Error loading books:', error);
            showToast('Failed to load your books', 'error');
        }
    }

    displayBooks(books) {
        const tableBody = document.getElementById('books-table-body');
        if (!tableBody) return;

        if (books.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-book" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem; display: block;"></i>
                        <p>No books yet. Add your first book to get started!</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = books.map(book => `
            <tr>
                <td>
                    ${book.cover_image ? 
                        `<img src="/uploads/covers/${book.cover_image}" alt="${book.title}" style="width: 50px; height: 60px; object-fit: cover; border-radius: 4px;">` :
                        `<div style="width: 50px; height: 60px; background: #eee; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                            <i class="fas fa-book" style="color: #ccc;"></i>
                         </div>`
                    }
                </td>
                <td>
                    <strong>${book.title}</strong>
                    <br>
                    <small style="color: #666;">${book.description ? book.description.substring(0, 50) + '...' : ''}</small>
                </td>
                <td>${book.genre || '-'}</td>
                <td>${book.is_free ? 'Free' : `$${book.price}`}</td>
                <td>
                    ${book.has_audiobook ? 
                        '<i class="fas fa-check text-success"></i>' : 
                        '<i class="fas fa-times text-muted"></i>'
                    }
                </td>
                <td>${book.published_date ? new Date(book.published_date).toLocaleDateString() : 'Not set'}</td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-sm btn-secondary" onclick="authorDashboard.editBook(${book.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="authorDashboard.deleteBook(${book.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterBooks() {
        const filter = document.getElementById('book-filter');
        if (!filter) return;

        // For now, just reload all books
        // In a real app, you'd implement filtering on the server side
        this.loadBooks();
    }

    showAddBookModal() {
        const modal = document.getElementById('add-book-modal');
        const modalTitle = document.getElementById('book-modal-title');
        const submitText = document.getElementById('book-submit-text');
        
        if (modal) {
            this.editingBook = null;
            if (modalTitle) modalTitle.textContent = 'Add New Book';
            if (submitText) submitText.textContent = 'Add Book';
            
            // Reset form
            const form = document.getElementById('add-book-form');
            if (form) form.reset();
            
            modal.style.display = 'block';
        }
    }

    closeAddBookModal() {
        const modal = document.getElementById('add-book-modal');
        if (modal) {
            modal.style.display = 'none';
            this.editingBook = null;
        }
    }

    async editBook(bookId) {
        try {
            showSpinner(true);
            
            const response = await fetch(`/api/books/${bookId}`);
            const data = await response.json();
            
            if (response.ok) {
                this.editingBook = data.book;
                this.populateEditForm(data.book);
                
                const modal = document.getElementById('add-book-modal');
                const modalTitle = document.getElementById('book-modal-title');
                const submitText = document.getElementById('book-submit-text');
                
                if (modal) {
                    if (modalTitle) modalTitle.textContent = 'Edit Book';
                    if (submitText) submitText.textContent = 'Update Book';
                    modal.style.display = 'block';
                }
            } else {
                throw new Error(data.error || 'Failed to load book details');
            }
        } catch (error) {
            console.error('Error editing book:', error);
            showToast(error.message, 'error');
        } finally {
            showSpinner(false);
        }
    }

    populateEditForm(book) {
        const form = document.getElementById('add-book-form');
        if (!form) return;

        // Populate form fields
        const fields = {
            'book-title': book.title,
            'book-genre': book.genre,
            'book-isbn': book.isbn,
            'book-price': book.price,
            'book-published-date': book.published_date,
            'book-description': book.description
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && value) {
                element.value = value;
            }
        });

        // Set checkbox
        const isFreeCheckbox = document.getElementById('book-is-free');
        if (isFreeCheckbox) {
            isFreeCheckbox.checked = book.is_free;
        }
    }

    async handleBookSubmit(e) {
        e.preventDefault();
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        const submitText = document.getElementById('book-submit-text');
        const submitSpinner = document.getElementById('book-submit-spinner');
        
        try {
            // Show loading state
            if (submitButton) submitButton.disabled = true;
            if (submitText) submitText.style.display = 'none';
            if (submitSpinner) submitSpinner.style.display = 'inline-block';
            
            const formData = new FormData(e.target);
            
            const url = this.editingBook ? `/api/books/${this.editingBook.id}` : '/api/books';
            const method = this.editingBook ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: formData
            });

            const data = await response.json();
            
            if (response.ok) {
                showToast(this.editingBook ? 'Book updated successfully!' : 'Book added successfully!', 'success');
                this.closeAddBookModal();
                this.loadBooks(); // Reload books table
                this.loadStats(); // Reload stats
            } else {
                throw new Error(data.error || 'Failed to save book');
            }
        } catch (error) {
            console.error('Error saving book:', error);
            showToast(error.message, 'error');
        } finally {
            // Reset loading state
            if (submitButton) submitButton.disabled = false;
            if (submitText) submitText.style.display = 'inline';
            if (submitSpinner) submitSpinner.style.display = 'none';
        }
    }

    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
            return;
        }

        try {
            showSpinner(true);
            
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                showToast('Book deleted successfully!', 'success');
                this.loadBooks(); // Reload books table
                this.loadStats(); // Reload stats
            } else {
                throw new Error(data.error || 'Failed to delete book');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            showToast(error.message, 'error');
        } finally {
            showSpinner(false);
        }
    }

    previewCoverImage(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file', 'error');
            e.target.value = '';
            return;
        }

        // Optional: Show image preview
        const reader = new FileReader();
        reader.onload = function(e) {
            // You could show a preview here if you add a preview element to the form
            console.log('Image loaded for preview');
        };
        reader.readAsDataURL(file);
    }

    showUploadAudiobookModal() {
        showToast('Audiobook upload functionality would be implemented here. For now, use the "Add Audiobook" field in the book form.', 'info');
    }
}

// Global functions for HTML onclick handlers
function showAddBookModal() {
    if (window.authorDashboard) {
        window.authorDashboard.showAddBookModal();
    }
}

function closeAddBookModal() {
    if (window.authorDashboard) {
        window.authorDashboard.closeAddBookModal();
    }
}

function showUploadAudiobookModal() {
    if (window.authorDashboard) {
        window.authorDashboard.showUploadAudiobookModal();
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.authorDashboard = new AuthorDashboard();
});