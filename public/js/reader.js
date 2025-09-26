// Reader Dashboard JavaScript
class ReaderDashboard {
    constructor() {
        this.currentUser = null;
        this.authToken = null;
        this.currentAudio = null;
        this.playbackSpeed = 1.0;
        
        this.init();
    }

    init() {
        // Check authentication
        if (!requireAuth()) return;
        
        this.currentUser = getCurrentUser();
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

        // Library filter
        const libraryFilter = document.getElementById('library-filter');
        if (libraryFilter) {
            libraryFilter.addEventListener('change', () => this.filterLibrary());
        }

        // Audio player controls
        this.setupAudioPlayerControls();
    }

    setupAudioPlayerControls() {
        const rewindBtn = document.getElementById('rewind-btn');
        const forwardBtn = document.getElementById('forward-btn');
        const speedBtn = document.getElementById('speed-btn');
        const audioElement = document.getElementById('audio-element');

        if (rewindBtn) {
            rewindBtn.addEventListener('click', () => this.rewindAudio(30));
        }

        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => this.fastForwardAudio(30));
        }

        if (speedBtn) {
            speedBtn.addEventListener('click', () => this.togglePlaybackSpeed());
        }

        if (audioElement) {
            audioElement.addEventListener('loadedmetadata', () => {
                console.log('Audio loaded');
            });
            
            audioElement.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                showToast('Error loading audiobook', 'error');
            });
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
            
            await Promise.all([
                this.loadSubscriptionStatus(),
                this.loadLibraryStats(),
                this.loadLibrary(),
                this.loadSubscriptions(),
                this.loadRecentActivity()
            ]);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            showToast('Failed to load dashboard data', 'error');
        } finally {
            showSpinner(false);
        }
    }

    async loadSubscriptionStatus() {
        try {
            const response = await fetch('/api/subscriptions/status/my', {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displaySubscriptionStatus(data.subscription);
            }
        } catch (error) {
            console.error('Error loading subscription status:', error);
        }
    }

    displaySubscriptionStatus(subscription) {
        const statusContainer = document.getElementById('subscription-status');
        if (!statusContainer) return;

        let statusClass = '';
        let statusMessage = '';
        let actionButton = '';

        if (subscription.type === 'free') {
            statusClass = 'expired';
            statusMessage = 'You are currently on the free plan. Upgrade to access premium books and audiobooks.';
            actionButton = '<a href="#subscription" class="btn btn-primary">Upgrade Now</a>';
        } else if (!subscription.isActive) {
            statusClass = 'expired';
            statusMessage = 'Your subscription has expired. Renew to continue accessing premium content.';
            actionButton = '<a href="#subscription" class="btn btn-primary">Renew Subscription</a>';
        } else if (subscription.daysRemaining <= 7) {
            statusClass = 'warning';
            statusMessage = `Your ${subscription.type} subscription expires in ${subscription.daysRemaining} days.`;
            actionButton = '<a href="#subscription" class="btn btn-secondary">Renew Early</a>';
        } else {
            statusMessage = `Your ${subscription.type} subscription is active${subscription.daysRemaining ? ` (${subscription.daysRemaining} days remaining)` : ''}.`;
            actionButton = '<button class="btn btn-secondary" onclick="readerDashboard.cancelSubscription()">Cancel Subscription</button>';
        }

        statusContainer.className = `subscription-status ${statusClass}`;
        statusContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h3><i class="fas fa-crown"></i> Subscription Status</h3>
                    <p>${statusMessage}</p>
                </div>
                <div>
                    ${actionButton}
                </div>
            </div>
        `;
    }

    async loadLibraryStats() {
        try {
            const response = await fetch(`/api/users/${this.currentUser.id}/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayLibraryStats(data.stats);
            }
        } catch (error) {
            console.error('Error loading library stats:', error);
        }
    }

    displayLibraryStats(stats) {
        const totalLibraryBooks = document.getElementById('total-library-books');
        const totalLibraryAudiobooks = document.getElementById('total-library-audiobooks');
        const booksThisMonth = document.getElementById('books-this-month');
        const favoriteGenre = document.getElementById('favorite-genre');

        if (totalLibraryBooks) totalLibraryBooks.textContent = stats.library_books || 0;
        if (totalLibraryAudiobooks) totalLibraryAudiobooks.textContent = '0'; // TODO: Count audiobooks
        if (booksThisMonth) booksThisMonth.textContent = stats.recent_purchases || 0;
        if (favoriteGenre) favoriteGenre.textContent = 'Fiction'; // TODO: Calculate favorite genre
    }

    async loadLibrary() {
        try {
            const response = await fetch('/api/books/library/my', {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.displayLibrary(data.books);
            } else {
                throw new Error('Failed to load library');
            }
        } catch (error) {
            console.error('Error loading library:', error);
            this.displayEmptyLibrary();
        }
    }

    displayLibrary(books) {
        const libraryGrid = document.getElementById('library-grid');
        const libraryEmpty = document.getElementById('library-empty');
        
        if (!libraryGrid) return;

        if (books.length === 0) {
            this.displayEmptyLibrary();
            return;
        }

        if (libraryEmpty) libraryEmpty.style.display = 'none';
        libraryGrid.style.display = 'grid';

        libraryGrid.innerHTML = books.map(book => `
            <div class="library-book" onclick="readerDashboard.openBook(${book.id}, '${book.title}', ${book.has_audiobook})">
                <div class="library-book-cover">
                    ${book.cover_image ? 
                        `<img src="/uploads/covers/${book.cover_image}" alt="${book.title}">` :
                        `<i class="fas fa-book" style="font-size: 3rem; color: #ccc;"></i>`
                    }
                </div>
                <div class="library-book-info">
                    <div class="library-book-title">${book.title}</div>
                    <div class="library-book-author">by ${book.author_name}</div>
                    ${book.has_audiobook ? '<div><i class="fas fa-headphones"></i> Audiobook</div>' : ''}
                    <div style="margin-top: 0.5rem;">
                        <small style="color: #666;">Added: ${new Date(book.purchase_date).toLocaleDateString()}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayEmptyLibrary() {
        const libraryGrid = document.getElementById('library-grid');
        const libraryEmpty = document.getElementById('library-empty');
        
        if (libraryGrid) libraryGrid.style.display = 'none';
        if (libraryEmpty) libraryEmpty.style.display = 'block';
    }

    filterLibrary() {
        const filter = document.getElementById('library-filter');
        if (!filter) return;

        // For now, just reload the library
        // In a real app, you'd implement filtering logic
        this.loadLibrary();
    }

    async loadSubscriptions() {
        try {
            const response = await fetch('/api/subscriptions');
            const data = await response.json();

            if (response.ok) {
                this.displaySubscriptions(data.subscriptions);
            }
        } catch (error) {
            console.error('Error loading subscriptions:', error);
        }
    }

    displaySubscriptions(subscriptions) {
        const subscriptionCards = document.getElementById('subscription-cards');
        if (!subscriptionCards) return;

        subscriptionCards.innerHTML = subscriptions.map((sub, index) => `
            <div class="subscription-card ${index === 1 ? 'featured' : ''} ${this.currentUser.subscription_type === sub.name.toLowerCase() ? 'current' : ''}">
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
                <button class="btn ${this.currentUser.subscription_type === sub.name.toLowerCase() ? 'btn-secondary' : 'btn-primary'}" 
                        onclick="readerDashboard.subscribe(${sub.id})"
                        ${this.currentUser.subscription_type === sub.name.toLowerCase() ? 'disabled' : ''}>
                    ${this.currentUser.subscription_type === sub.name.toLowerCase() ? 'Current Plan' : 'Choose Plan'}
                </button>
            </div>
        `).join('');
    }

    async subscribe(subscriptionId) {
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
                
                // Reload dashboard data
                this.loadDashboardData();
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

    async cancelSubscription() {
        if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium content.')) {
            return;
        }

        try {
            showSpinner(true);
            
            const response = await fetch('/api/subscriptions/cancel', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Subscription cancelled successfully', 'success');
                
                // Update user data
                this.currentUser.subscription_type = 'free';
                this.currentUser.subscription_expires = null;
                localStorage.setItem('userData', JSON.stringify(this.currentUser));
                
                // Reload dashboard data
                this.loadDashboardData();
            } else {
                throw new Error(data.error || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error canceling subscription:', error);
            showToast(error.message, 'error');
        } finally {
            showSpinner(false);
        }
    }

    async loadRecentActivity() {
        // Placeholder for recent activity
        const activityList = document.getElementById('activity-list');
        if (activityList) {
            activityList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <i class="fas fa-history" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    <p>No recent activity to display</p>
                </div>
            `;
        }
    }

    openBook(bookId, title, hasAudiobook) {
        const actions = [];
        
        actions.push({
            text: 'Read E-Book',
            icon: 'fas fa-book-open',
            action: () => this.openBookReader(bookId, title)
        });

        if (hasAudiobook) {
            actions.push({
                text: 'Play Audiobook',
                icon: 'fas fa-headphones',
                action: () => this.openAudioPlayer(bookId, title)
            });
        }

        if (actions.length === 1) {
            actions[0].action();
        } else {
            // Show selection modal or directly open both options
            this.showBookOptionsModal(bookId, title, actions);
        }
    }

    showBookOptionsModal(bookId, title, actions) {
        // For simplicity, just show both options as buttons
        const options = actions.map(action => 
            `<button class="btn btn-primary" style="margin: 0.5rem;" onclick="${action.action.toString().replace('function', 'function temp')}; temp();">
                <i class="${action.icon}"></i> ${action.text}
             </button>`
        ).join('');

        showToast(`Choose how to enjoy "${title}": ${options}`, 'info');
    }

    openBookReader(bookId, title) {
        const modal = document.getElementById('book-reader-modal');
        const bookTitle = document.getElementById('reader-book-title');
        const readerContent = document.getElementById('reader-content');

        if (!modal || !bookTitle || !readerContent) {
            showToast('Book reader not available', 'error');
            return;
        }

        bookTitle.textContent = title;
        readerContent.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-book-open" style="font-size: 3rem; color: #667eea; margin-bottom: 1rem;"></i>
                <h3>E-Book Reader</h3>
                <p>In a full implementation, this would display the actual book content.</p>
                <p>Features would include:</p>
                <ul style="text-align: left; max-width: 400px; margin: 1rem auto;">
                    <li>Full text rendering</li>
                    <li>Adjustable font sizes</li>
                    <li>Bookmarking</li>
                    <li>Page navigation</li>
                    <li>Progress tracking</li>
                    <li>Search functionality</li>
                </ul>
            </div>
        `;

        modal.style.display = 'block';
    }

    closeBookReader() {
        const modal = document.getElementById('book-reader-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    openAudioPlayer(bookId, title) {
        const modal = document.getElementById('audio-player-modal');
        const audioTitle = document.getElementById('audio-book-title');
        const audioElement = document.getElementById('audio-element');
        const audioSource = document.getElementById('audio-source');

        if (!modal || !audioTitle || !audioElement || !audioSource) {
            showToast('Audio player not available', 'error');
            return;
        }

        audioTitle.textContent = title;
        
        // In a real implementation, you'd load the actual audiobook file
        // For demo purposes, we'll show a placeholder
        audioSource.src = ''; // Would be `/uploads/audiobooks/${audiobook_file}`
        audioElement.load();

        // Show demo message
        showToast('In a full implementation, this would play the actual audiobook file', 'info');

        modal.style.display = 'block';
    }

    closeAudioPlayer() {
        const modal = document.getElementById('audio-player-modal');
        const audioElement = document.getElementById('audio-element');
        
        if (audioElement) {
            audioElement.pause();
        }
        
        if (modal) {
            modal.style.display = 'none';
        }
    }

    rewindAudio(seconds) {
        const audioElement = document.getElementById('audio-element');
        if (audioElement) {
            audioElement.currentTime = Math.max(0, audioElement.currentTime - seconds);
        }
    }

    fastForwardAudio(seconds) {
        const audioElement = document.getElementById('audio-element');
        if (audioElement) {
            audioElement.currentTime = Math.min(audioElement.duration, audioElement.currentTime + seconds);
        }
    }

    togglePlaybackSpeed() {
        const audioElement = document.getElementById('audio-element');
        const speedBtn = document.getElementById('speed-btn');
        
        if (!audioElement || !speedBtn) return;

        const speeds = [1.0, 1.25, 1.5, 2.0];
        const currentIndex = speeds.indexOf(this.playbackSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        
        this.playbackSpeed = speeds[nextIndex];
        audioElement.playbackRate = this.playbackSpeed;
        speedBtn.textContent = `${this.playbackSpeed}x Speed`;
    }
}

// Global functions for HTML onclick handlers
function closeBookReader() {
    if (window.readerDashboard) {
        window.readerDashboard.closeBookReader();
    }
}

function closeAudioPlayer() {
    if (window.readerDashboard) {
        window.readerDashboard.closeAudioPlayer();
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.readerDashboard = new ReaderDashboard();
});