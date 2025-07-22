// Gym Log Book JavaScript
class GymLogBook {
    constructor() {
        this.checkIns = JSON.parse(localStorage.getItem('gymCheckIns')) || [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCheckIns();
        this.setDefaultTimes();
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
        
        // Initialize testimonial carousel
        this.initTestimonialCarousel();
    }


    
    setDefaultTimes() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;
        
        const checkInTimeInput = document.getElementById('checkInTime');
        if (checkInTimeInput) {
            checkInTimeInput.value = currentTime;
        }
    }

    showApp() {
        document.getElementById('landingPage').style.display = 'none';
        document.getElementById('appContainer').style.display = 'block';
        // Scroll to top when entering app
        window.scrollTo(0, 0);
    }

    showLanding() {
        document.getElementById('appContainer').style.display = 'none';
        document.getElementById('landingPage').style.display = 'block';
        // Scroll to top when returning to landing
        window.scrollTo(0, 0);
    }

    scrollToFeatures() {
        const featuresSection = document.querySelector('.features');
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }


    
    showCheckInOutForm() {
        const dialog = document.getElementById('checkInDialog');
        if (!dialog) {
            console.error('Dialog element not found!');
            return;
        }
        this.clearCheckInForm();
        this.setDefaultTimes();
        // Force repaint before showing modal
        setTimeout(() => {
            dialog.showModal();
        }, 10);
    }

    showDashboard() {
        const dialog = document.getElementById('checkInDialog');
        if (dialog.open) {
            dialog.close();
        }
    }


    
    clearCheckInForm() {
        document.getElementById('checkInOutForm').reset();
        document.getElementById('memberName').value = '';
        this.setDefaultTimes();
    }



    saveToStorage() {
        localStorage.setItem('gymCheckIns', JSON.stringify(this.checkIns));
    }
    
    saveCheckInOut(e) {
        e.preventDefault();
        
        const memberName = document.getElementById('memberName').value;
        const checkInTime = document.getElementById('checkInTime').value;
        const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
        
        const today = new Date().toISOString().split('T')[0];
        
        const checkIn = {
            id: Date.now(),
            memberName: memberName,
            date: today,
            checkInTime: checkInTime,
            checkOutTime: null,
            paymentAmount: parseInt(paymentType),
            status: 'checked-in'
        };
        
        this.checkIns.unshift(checkIn);
        this.saveToStorage();
        this.renderCheckIns();
        this.clearCheckInForm();
        
        // Close the dialog
        const dialog = document.getElementById('checkInDialog');
        if (dialog.open) {
            dialog.close();
        }
        
        // Show success message
        this.showNotification(`${memberName} checked in successfully!`, 'success');
    }
    
    checkOutMember(id) {
        const checkInEntry = this.checkIns.find(entry => entry.id === parseInt(id));
        
        if (checkInEntry && checkInEntry.status === 'checked-in') {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${hours}:${minutes}`;
            
            checkInEntry.checkOutTime = currentTime;
            checkInEntry.status = 'checked-out';
            
            this.saveToStorage();
            this.renderCheckIns();
            
            // Show success message
            this.showNotification(`${checkInEntry.memberName} checked out successfully!`, 'success');
        }
    }


    
    renderCheckIns() {
        const checkInList = document.getElementById('checkInList');
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Filter check-ins for today
        const todayCheckIns = this.checkIns.filter(entry => entry.date === today);
        
        if (todayCheckIns.length === 0) {
            checkInList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-clock"></i>
                    <p>No check-ins recorded today.</p>
                </div>
            `;
            return;
        }
        
        checkInList.innerHTML = '';
        
        todayCheckIns.forEach(entry => {
            const template = document.getElementById('checkInEntryTemplate');
            const clone = document.importNode(template.content, true);
            
            const checkInEntry = clone.querySelector('.check-in-entry');
            checkInEntry.dataset.id = entry.id;
            
            // Set member name
            clone.querySelector('.member-name').textContent = entry.memberName;
            
            // Set status
            const statusElement = clone.querySelector('.check-in-status');
            statusElement.textContent = entry.status === 'checked-in' ? 'Checked In' : 'Checked Out';
            statusElement.classList.add(`status-${entry.status}`);
            
            // Set times
            clone.querySelector('.check-in-time span').textContent = this.formatTime(entry.checkInTime);
            
            const checkOutTimeElement = clone.querySelector('.check-out-time span');
            if (entry.checkOutTime) {
                checkOutTimeElement.textContent = this.formatTime(entry.checkOutTime);
            } else {
                checkOutTimeElement.textContent = 'Not checked out';
            }
            
            // Set payment amount
            clone.querySelector('.payment-amount span').textContent = `$${entry.paymentAmount}`;
            
            // Show check-out button if needed
            if (entry.status === 'checked-in') {
                clone.querySelector('.check-out-btn').style.display = 'flex';
            }
            
            checkInList.appendChild(clone);
        });
    }
    
    formatTime(timeString) {
        if (!timeString) return 'N/A';
        
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        
        return `${formattedHour}:${minutes} ${period}`;
    }
    

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#15803d' : '#1e3a8a'};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    initTestimonialCarousel() {
        const slides = document.querySelectorAll('.testimonial-slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.carousel-arrow.prev');
        const nextBtn = document.querySelector('.carousel-arrow.next');
        let currentSlide = 0;
        
        // Function to show a specific slide
        const showSlide = (index) => {
            // Hide all slides
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Show the selected slide
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            currentSlide = index;
        };
        
        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });
        
        // Event listeners for arrows
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let newIndex = currentSlide - 1;
                if (newIndex < 0) newIndex = slides.length - 1;
                showSlide(newIndex);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let newIndex = currentSlide + 1;
                if (newIndex >= slides.length) newIndex = 0;
                showSlide(newIndex);
            });
        }
        
        // Auto-advance slides every 5 seconds
        setInterval(() => {
            let newIndex = currentSlide + 1;
            if (newIndex >= slides.length) newIndex = 0;
            showSlide(newIndex);
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GymLogBook();
});