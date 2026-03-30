// frontend/js/main.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('Boarding School Visiting System loaded');
    
    // Initialize tooltips or any other UI enhancements
    initializeUI();
    initializeCounterAnimation();
});

// Initialize UI elements
function initializeUI() {
    // Add any smooth scrolling or animations here
    addSmoothScroll();
}

// Smooth scroll for anchor links
function addSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// Counter animation for statistics
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 50; // Increased for slower animation (higher number = slower)

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let count = 0;
        const increment = target / speed;

        // Add animating class
        counter.classList.add('animating');

        const updateCount = () => {
            count += increment;
            if (count < target) {
                counter.innerText = Math.floor(count);
                setTimeout(updateCount, 30); // Increased delay for smoother animation
            } else {
                counter.innerText = target;
                // Remove animating class after animation completes
                setTimeout(() => {
                    counter.classList.remove('animating');
                }, 1000);
            }
        };

        updateCount();
    });
}

// Intersection Observer for triggering animations when stats come into view
function initializeCounterAnimation() {
    const statsSection = document.querySelector('.about-stats');
    
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5 // Trigger when 50% of the section is visible
        });
        
        observer.observe(statsSection);
    }
}

// AJAX function for updating visit status
function updateVisitStatus(visitId, status) {
    fetch('/visits/update-status', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            id: visitId,
            status: status
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('Visit status updated successfully');
            showAlert(`Visit ${status.toLowerCase()} successfully!`, 'success');
            // Reload or update UI
            setTimeout(() => location.reload(), 1000);
        } else {
            alert('Failed to update status: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    });
}

// Mark notification as read
function markNotificationAsRead(notificationId) {
    fetch('/notifications/mark-read', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: notificationId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Notification marked as read');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/auth/logout';
    }
}

// Show alert messages
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Export functions for use in global scope
window.updateVisitStatus = updateVisitStatus;
window.markNotificationAsRead = markNotificationAsRead;
window.logout = logout;
window.validateForm = validateForm;
window.showAlert = showAlert;
