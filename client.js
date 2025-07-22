// Gym Log Book JavaScript - Client Side
class GymLogBook {
    constructor() {
        this.checkIns = [];
        this.currentDate = new Date().toISOString().split('T')[0]; // Default to today
        this.availableDates = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadCheckIns();
        this.setDefaultTimes();
        this.initTestimonialCarousel();
    }

    bindEvents() {
        // Landing page navigation
        document.getElementById('getStartedBtn').addEventListener('click', () => this.showApp());
        document.getElementById('startTrackingBtn').addEventListener('click', () => this.showApp());
        document.getElementById('startNowBtn').addEventListener('click', () => this.showApp());
        document.getElementById('learnMoreBtn').addEventListener('click', () => this.scrollToFeatures());
        
        // App navigation
        document.getElementById('backToLandingBtn').addEventListener('click', () => this.showLanding());
        
        // Check In/Out navigation
        document.getElementById('cancelCheckInOutBtn').addEventListener('click', () => this.showDashboard());
        document.getElementById('dashboardCheckInBtn').addEventListener('click', () => this.showCheckInOutForm());
        
        // Form submissions
        document.getElementById('checkInOutForm').addEventListener('submit', (e) => this.saveCheckInOut(e));
        
        // Archive navigation
        document.getElementById('archiveBtn').addEventListener('click', () => this.toggleArchiveView());
        document.getElementById('dateSelector').addEventListener('change', (e) => this.loadCheckInsForDate(e.target.value));
        document.getElementById('backToTodayBtn').addEventListener('click', () => this.loadCheckInsForDate());
        
        // Dynamic event delegation for check-in/out actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.check-out-btn')) {
                this.checkOutMember(e.target.closest('.check-in-entry').dataset.id);
            }
        });
        
        // Ensure dialog closes when clicking on backdrop (optional UX improvement)
        const dialog = document.getElementById('checkInDialog');
        if (dialog) {
            dialog.addEventListener('click', (e) => {
                // Only close if the click is directly on the dialog element (backdrop), not on its children
                if (e.target === dialog) {
                    dialog.close();
                }
            });
        }
    }

    setDefaultTimes() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;
        
        document.getElementById('checkInTime').value = currentTime;
    }

    showApp() {
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
    }

    showLanding() {
        document.getElementById('appContainer').style.display = 'none';
        document.getElementById('landingPage').style.display = 'block';
    }

    scrollToFeatures() {
        document.querySelector('.features').scrollIntoView({ behavior: 'smooth' });
    }

    showCheckInOutForm() {
        const dialog = document.getElementById('checkInDialog');
        dialog.showModal();
    }

    showDashboard() {
        const dialog = document.getElementById('checkInDialog');
        dialog.close();
    }

    // API Methods
    async loadCheckIns() {
        try {
            // Load available dates for archive
            await this.loadAvailableDates();
            
            // Load check-ins for current date
            await this.loadCheckInsForDate(this.currentDate);
        } catch (error) {
            console.error('Error loading check-ins:', error);
            this.showNotification('Failed to load check-ins. Please try again.', 'error');
        }
    }
    
    async loadAvailableDates() {
        try {
            const response = await fetch('/api/check-ins/dates');
            if (!response.ok) {
                throw new Error('Failed to fetch available dates');
            }
            
            this.availableDates = await response.json();
            this.updateDateSelector();
        } catch (error) {
            console.error('Error loading available dates:', error);
        }
    }
    
    async loadCheckInsForDate(date = null) {
        try {
            // If no date provided, use today's date
            if (!date) {
                date = new Date().toISOString().split('T')[0];
            }
            
            this.currentDate = date;
            
            // Update UI to show which date we're viewing
            this.updateDateDisplay();
            
            const response = await fetch(`/api/check-ins?date=${date}`);
            if (!response.ok) {
                throw new Error('Failed to fetch check-ins');
            }
            
            this.checkIns = await response.json();
            this.renderCheckIns();
        } catch (error) {
            console.error('Error loading check-ins for date:', error);
            this.showNotification(`Failed to load check-ins for ${date}. Please try again.`, 'error');
        }
    }
    
    updateDateSelector() {
        const dateSelector = document.getElementById('dateSelector');
        dateSelector.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a date...';
        dateSelector.appendChild(defaultOption);
        
        // Add options for each available date
        this.availableDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = this.formatDate(date);
            dateSelector.appendChild(option);
        });
    }
    
    updateDateDisplay() {
        const dateDisplay = document.getElementById('currentDateDisplay');
        const isToday = this.currentDate === new Date().toISOString().split('T')[0];
        
        if (isToday) {
            dateDisplay.textContent = 'Today';
            document.getElementById('backToTodayBtn').style.display = 'none';
            document.getElementById('archiveHeader').style.display = 'none';
        } else {
            dateDisplay.textContent = this.formatDate(this.currentDate);
            document.getElementById('backToTodayBtn').style.display = 'inline-block';
            document.getElementById('archiveHeader').style.display = 'flex';
        }
    }
    
    toggleArchiveView() {
        const archiveSection = document.getElementById('archiveSection');
        if (archiveSection.style.display === 'none' || !archiveSection.style.display) {
            archiveSection.style.display = 'block';
        } else {
            archiveSection.style.display = 'none';
        }
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    async saveCheckInOut(e) {
        e.preventDefault();
        
        const memberName = document.getElementById('memberName').value;
        const checkInTime = document.getElementById('checkInTime').value;
        const paymentAmount = document.querySelector('input[name="paymentType"]:checked').value;
        
        try {
            const response = await fetch('/api/check-ins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    memberName,
                    checkInTime,
                    paymentAmount
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save check-in');
            }
            
            const newCheckIn = await response.json();
            
            // Reload check-ins to ensure we have the latest data
            await this.loadCheckInsForDate(this.currentDate);
            
            // Also reload available dates as we might have added a new date
            await this.loadAvailableDates();
            
            // Clear form and close dialog
            document.getElementById('memberName').value = '';
            this.setDefaultTimes();
            document.getElementById('checkInDialog').close();
            
            // Show success message
            this.showNotification(`${memberName} checked in successfully!`, 'success');
        } catch (error) {
            console.error('Error saving check-in:', error);
            this.showNotification('Failed to save check-in. Please try again.', 'error');
        }
    }

    async checkOutMember(id) {
        try {
            const response = await fetch(`/api/check-ins/${id}/checkout`, {
                method: 'PUT'
            });
            
            if (!response.ok) {
                throw new Error('Failed to check out member');
            }
            
            const updatedCheckIn = await response.json();
            
            // Update the check-in in the array
            const index = this.checkIns.findIndex(entry => entry.id === parseInt(id));
            if (index !== -1) {
                this.checkIns[index] = updatedCheckIn;
            }
            
            // Re-render the check-ins to show the updated status
            this.renderCheckIns();
            
            // Show success message
            this.showNotification(`${updatedCheckIn.member_name} checked out successfully!`, 'success');
        } catch (error) {
            console.error('Error checking out member:', error);
            this.showNotification('Failed to check out member. Please try again.', 'error');
        }
    }

    renderCheckIns() {
        const checkInList = document.getElementById('checkInList');
        
        if (this.checkIns.length === 0) {
            const isToday = this.currentDate === new Date().toISOString().split('T')[0];
            const message = isToday ? 'No check-ins recorded today.' : 'No check-ins recorded for this date.';
            
            checkInList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-clock"></i>
                    <p>${message}</p>
                </div>
            `;
            return;
        }
        
        checkInList.innerHTML = '';
        
        this.checkIns.forEach(entry => {
            const template = document.getElementById('checkInEntryTemplate');
            const clone = document.importNode(template.content, true);
            
            const checkInEntry = clone.querySelector('.check-in-entry');
            checkInEntry.dataset.id = entry.id;
            
            // Set member name
            clone.querySelector('.member-name').textContent = entry.member_name;
            
            // Set status
            const statusElement = clone.querySelector('.check-in-status');
            statusElement.textContent = entry.status === 'checked-in' ? 'Checked In' : 'Checked Out';
            statusElement.classList.add(`status-${entry.status}`);
            
            // Set times
            clone.querySelector('.check-in-time span').textContent = this.formatTime(entry.check_in_time);
            
            const checkOutTimeElement = clone.querySelector('.check-out-time span');
            if (entry.check_out_time) {
                checkOutTimeElement.textContent = this.formatTime(entry.check_out_time);
            } else {
                checkOutTimeElement.textContent = 'Not checked out';
            }
            
            // Set payment amount
            clone.querySelector('.payment-amount span').textContent = `$${entry.payment_amount}`;
            
            // Show check-out button if needed
            if (entry.status === 'checked-in') {
                clone.querySelector('.check-out-btn').style.display = 'flex';
            }
            
            checkInList.appendChild(clone);
        });
    }

    formatTime(timeString) {
        if (!timeString) return 'N/A';
        
        // Handle MySQL TIME format (HH:MM:SS)
        const timeParts = timeString.split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = hours % 12 || 12;
        
        return `${formattedHour}:${minutes} ${period}`;
    }

    initTestimonialCarousel() {
        const slides = document.querySelectorAll('.testimonial-slide');
        const dots = document.querySelectorAll('.dot');
        const prevArrow = document.querySelector('.carousel-arrow.prev');
        const nextArrow = document.querySelector('.carousel-arrow.next');
        let currentSlide = 0;
        let interval;

        // Function to show a specific slide
        const showSlide = (index) => {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Remove active class from all dots
            dots.forEach(dot => {
                dot.classList.remove('active');
            });
            
            // Show the current slide and activate its dot
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            
            // Update current slide index
            currentSlide = index;
        };

        // Set up dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                resetInterval();
            });
        });

        // Set up arrow navigation
        if (prevArrow) {
            prevArrow.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                showSlide(currentSlide);
                resetInterval();
            });
        }

        if (nextArrow) {
            nextArrow.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
                resetInterval();
            });
        }

        // Auto-advance slides
        const startInterval = () => {
            interval = setInterval(() => {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            }, 5000); // Change slide every 5 seconds
        };

        const resetInterval = () => {
            clearInterval(interval);
            startInterval();
        };

        // Initialize the carousel
        showSlide(0);
        startInterval();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <p>${message}</p>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GymLogBook();
});