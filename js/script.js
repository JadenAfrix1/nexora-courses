document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initAuth();
    initForms();
    initPayment();
    initAccessCode();
    initAdmin();
    initCourseBadges();
    initResponsive();
    
    // Check for notifications in URL
    checkUrlNotifications();
});

// ======================
// AUTHENTICATION SYSTEM
// ======================
function initAuth() {
    // Check authentication status on protected pages
    checkAuth();
    
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

function checkAuth() {
    const protectedPages = [
        'courses.html', 
        'youtube-automation.html', 
        'digital-marketing.html',
        'data-science.html',
        'access-code.html',
        'payment.html',
        'admin/dashboard.html',
        'admin/manage-codes.html',
        'admin/manage-admins.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const user = getCurrentUser();
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
        } else {
            // Update UI for authenticated user
            updateAuthUI(user);
        }
    }
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function updateAuthUI(user) {
    const authLinks = document.querySelector('.auth-links');
    if (authLinks) {
        authLinks.innerHTML = `
            <li><a href="courses.html"><i class="fas fa-book"></i> Courses</a></li>
            <li><a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Check if admin and update UI accordingly
    if (user.isAdmin) {
        const adminLink = document.createElement('li');
        adminLink.innerHTML = `<a href="admin/dashboard.html"><i class="fas fa-cog"></i> Admin</a>`;
        document.querySelector('.nav-links').appendChild(adminLink);
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    showNotification('success', 'Logged out successfully');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ======================
// FORM HANDLING
// ======================
function initForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            loginUser(email, password);
        });
    }
    
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
                showNotification('error', 'Passwords do not match!');
                return;
            }
            
            if (password.length < 6) {
                showNotification('error', 'Password must be at least 6 characters long');
                return;
            }
            
            signupUser(name, email, password);
        });
    }
}

function loginUser(email, password) {
    // Check if user exists
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
        // Store current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification('success', 'Login successful!');
        
        // Redirect based on user type
        setTimeout(() => {
            if (user.isAdmin) {
                window.location.href = 'admin/dashboard.html';
            } else {
                window.location.href = 'courses.html';
            }
        }, 1000);
    } else {
        // Check if it's the main admin
        if (email.toLowerCase() === 'tawandamahachi07@gmail.com' && password === 'mahachi2007') {
            const adminUser = {
                id: 'admin',
                name: 'Main Admin',
                email: 'tawandamahachi07@gmail.com',
                isAdmin: true,
                isSuperAdmin: true,
                courses: [],
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            // Ensure admin exists in users list
            let users = getUsers();
            if (!users.some(u => u.email === adminUser.email)) {
                users.push(adminUser);
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            showNotification('success', 'Admin login successful!');
            setTimeout(() => {
                window.location.href = 'admin/dashboard.html';
            }, 1000);
        } else {
            showNotification('error', 'Invalid email or password!');
        }
    }
}

function signupUser(name, email, password) {
    // Validate inputs
    if (!name || name.length < 2) {
        showNotification('error', 'Name must be at least 2 characters long');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('error', 'Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showNotification('error', 'Password must be at least 6 characters long');
        return;
    }
    
    // Check if user already exists
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showNotification('error', 'Email already registered!');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        isAdmin: false,
        courses: [],
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log in the new user
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    showNotification('success', 'Account created successfully!');
    
    setTimeout(() => {
        window.location.href = 'courses.html';
    }, 1000);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ======================
// PAYMENT SYSTEM
// ======================
function initPayment() {
    // WhatsApp payment buttons
    const usdBtn = document.getElementById('pay-usd');
    const nairaBtn = document.getElementById('pay-naira');
    const cryptoBtn = document.getElementById('pay-crypto');
    
    if (usdBtn) {
        usdBtn.addEventListener('click', function() {
            const course = localStorage.getItem('selectedCourse');
            const message = `Hello, I want to purchase the ${course} course using USD.`;
            const whatsappUrl = `https://wa.me/263784812740?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
    
    if (nairaBtn) {
        nairaBtn.addEventListener('click', function() {
            const course = localStorage.getItem('selectedCourse');
            const message = `Hello, I want to purchase the ${course} course using Naira.`;
            const whatsappUrl = `https://wa.me/2347048929112?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
    
    if (cryptoBtn) {
        cryptoBtn.addEventListener('click', function() {
            const course = localStorage.getItem('selectedCourse');
            const message = `Hello, I want to purchase the ${course} course using Cryptocurrency.`;
            const whatsappUrl = `https://wa.me/2347048929112?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
}

// ======================
// ACCESS CODE SYSTEM
// ======================
function initAccessCode() {
    // Initialize access code input fields
    const codeInputs = document.querySelectorAll('.code-input');
    if (codeInputs.length > 0) {
        codeInputs.forEach((input, index) => {
            input.addEventListener('input', function() {
                if (this.value && index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
            });
            
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && !this.value && index > 0) {
                    codeInputs[index - 1].focus();
                }
            });
        });
        
        // Verify code button
        const verifyCodeBtn = document.getElementById('verify-code-btn');
        if (verifyCodeBtn) {
            verifyCodeBtn.addEventListener('click', verifyAccessCode);
        }
    }
    
    // Copy code functionality
    const copyIcons = document.querySelectorAll('.copy-icon');
    copyIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const code = this.closest('.code-cell').querySelector('span').textContent;
            navigator.clipboard.writeText(code).then(() => {
                showNotification('success', 'Access code copied to clipboard!');
                
                // Visual feedback
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showNotification('error', 'Failed to copy code');
            });
        });
    });
}

function verifyAccessCode() {
    const codeInputs = document.querySelectorAll('.code-input');
    const code = Array.from(codeInputs).map(input => input.value).join('').toUpperCase();
    const course = localStorage.getItem('selectedCourse');
    
    if (code.length !== 8) {
        showNotification('error', 'Please enter a valid 8-character access code!');
        return;
    }
    
    const codes = getAccessCodes();
    const codeObj = codes.find(c => c.code === code && c.course === course);
    
    if (!codeObj) {
        showNotification('error', 'Invalid access code for this course!');
        return;
    }
    
    if (codeObj.status === 'used') {
        showNotification('error', 'This access code has already been used!');
        return;
    }
    
    // Update code status
    const user = getCurrentUser();
    const updatedCodes = codes.map(c => 
        c.code === code ? {...c, status: 'used', userEmail: user.email, usedAt: new Date().toISOString()} : c
    );
    localStorage.setItem('accessCodes', JSON.stringify(updatedCodes));
    
    // Add course to user
    user.courses = user.courses || [];
    if (!user.courses.includes(course)) {
        user.courses.push(course);
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    showNotification('success', 'Access code verified! Redirecting to course...');
    
    // Redirect to course
    setTimeout(() => {
        if (course === 'YouTube Automation') {
            window.location.href = 'youtube-automation.html';
        } else if (course === 'Digital Marketing') {
            window.location.href = 'digital-marketing.html';
        } else if (course === 'Data Science Fundamentals') {
            window.location.href = 'data-science.html';
        }
    }, 1500);
}

// ======================
// ADMIN SYSTEM
// ======================
function initAdmin() {
    // Admin dashboard
    if (window.location.pathname.includes('admin/dashboard.html')) {
        loadAdminDashboard();
    }
    
    // Manage codes
    if (window.location.pathname.includes('admin/manage-codes.html')) {
        loadManageCodes();
    }
    
    // Manage admins
    if (window.location.pathname.includes('admin/manage-admins.html')) {
        loadManageAdmins();
    }
    
    // Generate code button
    const generateCodeBtn = document.getElementById('generate-code-btn');
    if (generateCodeBtn) {
        generateCodeBtn.addEventListener('click', generateAccessCode);
    }
    
    // Add admin button
    const addAdminBtn = document.getElementById('add-admin-btn');
    if (addAdminBtn) {
        addAdminBtn.addEventListener('click', addAdmin);
    }
}

function loadAdminDashboard() {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
        window.location.href = 'courses.html';
        return;
    }
    
    // Update dashboard with stats
    const totalUsers = getUsers().length;
    const totalCodes = getAccessCodes().length;
    const usedCodes = getAccessCodes().filter(code => code.status === 'used').length;
    
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-codes').textContent = totalCodes;
    document.getElementById('used-codes').textContent = usedCodes;
}

function loadManageCodes() {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
        window.location.href = 'courses.html';
        return;
    }
    
    renderAccessCodes();
}

function renderAccessCodes() {
    const codes = getAccessCodes();
    const tableBody = document.querySelector('#codes-table tbody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (codes.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2.5rem; color: #a0a0c0;">No access codes generated yet</td>
            </tr>
        `;
        return;
    }
    
    codes.forEach(code => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="code-cell">
                <span>${code.code}</span>
                <i class="fas fa-copy copy-icon"></i>
            </td>
            <td>${code.course}</td>
            <td>${code.userEmail || 'Not assigned'}</td>
            <td>
                <span class="status ${code.status === 'active' ? 'status-active' : 
                    code.status === 'pending' ? 'status-pending' : 'status-used'}">
                    ${formatStatus(code.status)}
                </span>
            </td>
            <td>${formatDate(code.createdAt)}</td>
            <td>${code.usedAt ? formatDate(code.usedAt) : 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Reinitialize copy functionality
    const copyIcons = document.querySelectorAll('.copy-icon');
    copyIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const code = this.closest('.code-cell').querySelector('span').textContent;
            navigator.clipboard.writeText(code).then(() => {
                showNotification('success', 'Access code copied to clipboard!');
                
                // Visual feedback
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showNotification('error', 'Failed to copy code');
            });
        });
    });
}

function generateAccessCode() {
    const courseSelect = document.getElementById('course-select');
    const course = courseSelect.value;
    
    if (!course) {
        showNotification('error', 'Please select a course!');
        return;
    }
    
    const code = generateRandomCode(8);
    const newCode = {
        id: Date.now().toString(),
        code,
        course,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    let codes = getAccessCodes();
    codes.push(newCode);
    localStorage.setItem('accessCodes', JSON.stringify(codes));
    
    renderAccessCodes();
    showNotification('success', `Access code generated: ${code}`);
    
    // Reset selection
    courseSelect.value = '';
}

function generateRandomCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function loadManageAdmins() {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
        window.location.href = 'courses.html';
        return;
    }
    
    renderAdmins();
}

function renderAdmins() {
    const users = getUsers();
    const admins = users.filter(user => user.isAdmin);
    const tableBody = document.querySelector('#admins-table tbody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (admins.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2.5rem; color: #a0a0c0;">No admins found</td>
            </tr>
        `;
        return;
    }
    
    admins.forEach(admin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${admin.name}</td>
            <td>${admin.email}</td>
            <td>
                <span class="status ${admin.isSuperAdmin ? 'status-active' : 'status-pending'}">
                    ${admin.isSuperAdmin ? 'Super Admin' : 'Admin'}
                </span>
            </td>
            <td>
                ${!admin.isSuperAdmin ? 
                    `<button class="btn btn-danger btn-sm" onclick="removeAdmin('${admin.id}')">Remove</button>` : 
                    '<span style="color: #00d2d3;">Primary Admin</span>'}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addAdmin() {
    const emailInput = document.getElementById('admin-email');
    const email = emailInput.value.trim();
    
    if (!email) {
        showNotification('error', 'Please enter an email address!');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('error', 'Please enter a valid email address!');
        return;
    }
    
    // Check if user exists
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
        showNotification('error', 'User not found!');
        return;
    }
    
    // Check if user is already admin
    if (users[userIndex].isAdmin) {
        showNotification('error', 'User is already an admin!');
        return;
    }
    
    // Make user an admin
    users[userIndex].isAdmin = true;
    localStorage.setItem('users', JSON.stringify(users));
    
    renderAdmins();
    emailInput.value = '';
    showNotification('success', `User ${email} has been made an admin!`);
}

function removeAdmin(userId) {
    const user = getCurrentUser();
    
    if (userId === 'admin' || userId === user.id) {
        showNotification('error', 'You cannot remove this admin!');
        return;
    }
    
    if (confirm('Are you sure you want to remove this admin? This action cannot be undone.')) {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].isAdmin = false;
            localStorage.setItem('users', JSON.stringify(users));
            renderAdmins();
            showNotification('success', 'Admin privileges removed successfully!');
        }
    }
}

// ======================
// COURSE SYSTEM
// ======================
function initCourseBadges() {
    // YouTube badge animation
    const youtubeBadge = document.querySelector('.youtube-badge .course-badge');
    if (youtubeBadge) {
        youtubeBadge.style.animation = 'float 6s ease-in-out infinite';
        
        // Add subtle pulse on hover
        youtubeBadge.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        youtubeBadge.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }
    
    // Digital badge animation
    const digitalBadge = document.querySelector('.digital-badge .course-badge');
    if (digitalBadge) {
        digitalBadge.style.animation = 'float 7s ease-in-out infinite';
        digitalBadge.style.animationDelay = '0.5s';
        
        digitalBadge.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        digitalBadge.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }
    
    // Data science badge animation
    const dataScienceBadge = document.querySelector('.data-science-badge .course-badge');
    if (dataScienceBadge) {
        dataScienceBadge.style.animation = 'float 8s ease-in-out infinite';
        dataScienceBadge.style.animationDelay = '1s';
        
        dataScienceBadge.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        dataScienceBadge.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }
}

function initCourseSelection() {
    // Course selection
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', function() {
            const courseName = this.getAttribute('data-course');
            localStorage.setItem('selectedCourse', courseName);
            
            // Data Science is free
            if (courseName === 'Data Science Fundamentals') {
                const user = getCurrentUser();
                user.courses = user.courses || [];
                if (!user.courses.includes(courseName)) {
                    user.courses.push(courseName);
                    const users = getUsers();
                    const userIndex = users.findIndex(u => u.id === user.id);
                    if (userIndex !== -1) {
                        users[userIndex] = user;
                        localStorage.setItem('users', JSON.stringify(users));
                    }
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
                window.location.href = 'data-science.html';
            } else {
                window.location.href = 'access-code.html';
            }
        });
    });
}

// ======================
// UTILITY FUNCTIONS
// ======================
function getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function getAccessCodes() {
    return JSON.parse(localStorage.getItem('accessCodes') || '[]');
}

function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `notification ${type} show`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function checkUrlNotifications() {
    const urlParams = new URLSearchParams(window.location.search);
    const notification = urlParams.get('notification');
    
    if (notification) {
        const [type, message] = notification.split(':');
        showNotification(type, message);
    }
}

function initResponsive() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
    }
    
    // Close mobile menu when clicking a link
    const navLinksItems = document.querySelectorAll('.nav-links a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                navLinks.classList.remove('active');
                mobileToggle.querySelector('i').classList.add('fa-bars');
                mobileToggle.querySelector('i').classList.remove('fa-times');
            }
        });
    });
}