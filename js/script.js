document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status on protected pages
    checkAuth();
    
    // Initialize form handlers
    initForms();
    
    // Initialize payment handlers
    initPayment();
    
    // Initialize admin features
    initAdmin();
    
    // Initialize access code functionality
    initAccessCode();
    
    // Initialize course functionality
    initCourses();
});

// Authentication functions
function checkAuth() {
    const protectedPages = ['courses.html', 'youtube-automation.html', 'digital-marketing.html', 
                          'data-science.html', 'access-code.html', 'payment.html', 
                          'admin/dashboard.html', 'admin/manage-codes.html', 'admin/manage-admins.html'];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        const user = localStorage.getItem('currentUser');
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
        } else {
            // Update UI for authenticated user
            updateAuthUI(JSON.parse(user));
        }
    }
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

function initForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            loginUser(email, password);
        });
    }
    
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            signupUser(name, email, password);
        });
    }
}

function loginUser(email, password) {
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'courses.html';
    } else {
        // Check if it's the main admin
        if (email === 'tawandamahachi07@gmail.com' && password === 'mahachi2007') {
            const adminUser = {
                id: 'admin',
                name: 'Main Admin',
                email: 'tawandamahachi07@gmail.com',
                isAdmin: true,
                courses: []
            };
            
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            window.location.href = 'admin/dashboard.html';
        } else {
            alert('Invalid email or password!');
        }
    }
}

function signupUser(name, email, password) {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.email === email)) {
        alert('Email already registered!');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        isAdmin: false,
        courses: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Log in the new user
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    window.location.href = 'courses.html';
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Payment functions
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

// Admin functions
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
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.isAdmin) {
        window.location.href = 'courses.html';
        return;
    }
    
    // Update dashboard with stats
    const totalUsers = JSON.parse(localStorage.getItem('users') || '[]').length;
    const totalCodes = JSON.parse(localStorage.getItem('accessCodes') || '[]').length;
    const usedCodes = JSON.parse(localStorage.getItem('accessCodes') || '[]')
        .filter(code => code.status === 'used').length;
    
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-codes').textContent = totalCodes;
    document.getElementById('used-codes').textContent = usedCodes;
}

function loadManageCodes() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.isAdmin) {
        window.location.href = 'courses.html';
        return;
    }
    
    renderAccessCodes();
}

function renderAccessCodes() {
    const codes = JSON.parse(localStorage.getItem('accessCodes') || '[]');
    const tableBody = document.querySelector('#codes-table tbody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (codes.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem;">No access codes generated yet</td>
            </tr>
        `;
        return;
    }
    
    codes.forEach(code => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${code.code}</td>
            <td>${code.course}</td>
            <td>${code.userEmail || 'Not assigned'}</td>
            <td>
                <span class="status ${code.status === 'active' ? 'status-active' : 
                    code.status === 'pending' ? 'status-pending' : 'status-used'}">
                    ${code.status.charAt(0).toUpperCase() + code.status.slice(1)}
                </span>
            </td>
            <td>${new Date(code.createdAt).toLocaleDateString()}</td>
        `;
        tableBody.appendChild(row);
    });
}

function generateAccessCode() {
    const courseSelect = document.getElementById('course-select');
    const course = courseSelect.value;
    
    if (!course) {
        alert('Please select a course!');
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
    
    let codes = JSON.parse(localStorage.getItem('accessCodes') || '[]');
    codes.push(newCode);
    localStorage.setItem('accessCodes', JSON.stringify(codes));
    
    renderAccessCodes();
    alert(`Access code generated: ${code}\nCourse: ${course}`);
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
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || !user.isAdmin) {
        window.location.href = 'courses.html';
        return;
    }
    
    renderAdmins();
}

function renderAdmins() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const admins = users.filter(user => user.isAdmin);
    const tableBody = document.querySelector('#admins-table tbody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    admins.forEach(admin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${admin.name}</td>
            <td>${admin.email}</td>
            <td>
                <span class="status ${admin.email === 'tawandamahachi07@gmail.com' ? 'status-active' : 'status-pending'}">
                    ${admin.email === 'tawandamahachi07@gmail.com' ? 'Super Admin' : 'Admin'}
                </span>
            </td>
            <td>
                ${admin.email !== 'tawandamahachi07@gmail.com' ? 
                    `<button class="btn btn-danger btn-sm" onclick="removeAdmin('${admin.id}')">Remove</button>` : 
                    'Cannot be removed'}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addAdmin() {
    const email = document.getElementById('admin-email').value;
    
    if (!email) {
        alert('Please enter an email address!');
        return;
    }
    
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
        alert('User not found!');
        return;
    }
    
    // Make user an admin
    users[userIndex].isAdmin = true;
    localStorage.setItem('users', JSON.stringify(users));
    
    renderAdmins();
    document.getElementById('admin-email').value = '';
    alert(`User ${email} has been made an admin!`);
}

function removeAdmin(userId) {
    if (confirm('Are you sure you want to remove this admin?')) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].isAdmin = false;
            localStorage.setItem('users', JSON.stringify(users));
            renderAdmins();
        }
    }
}

// Access code functions
function initAccessCode() {
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    if (verifyCodeBtn) {
        verifyCodeBtn.addEventListener('click', verifyAccessCode);
    }
    
    // Initialize access code input fields
    const codeInputs = document.querySelectorAll('.code-input');
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
}

function verifyAccessCode() {
    const codeInputs = document.querySelectorAll('.code-input');
    const code = Array.from(codeInputs).map(input => input.value).join('');
    const course = localStorage.getItem('selectedCourse');
    
    if (code.length !== 8) {
        alert('Please enter a valid 8-character access code!');
        return;
    }
    
    const codes = JSON.parse(localStorage.getItem('accessCodes') || '[]');
    const codeObj = codes.find(c => c.code === code && c.course === course);
    
    if (!codeObj) {
        alert('Invalid access code for this course!');
        return;
    }
    
    if (codeObj.status === 'used') {
        alert('This access code has already been used!');
        return;
    }
    
    // Update code status
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const updatedCodes = codes.map(c => 
        c.code === code ? {...c, status: 'used', userEmail: user.email} : c
    );
    localStorage.setItem('accessCodes', JSON.stringify(updatedCodes));
    
    // Add course to user
    user.courses = user.courses || [];
    if (!user.courses.includes(course)) {
        user.courses.push(course);
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    // Redirect to course
    if (course === 'YouTube Automation') {
        window.location.href = 'youtube-automation.html';
    } else if (course === 'Digital Marketing') {
        window.location.href = 'digital-marketing.html';
    } else if (course === 'Data Science Fundamentals') {
        window.location.href = 'data-science.html';
    }
}

// Course functions
function initCourses() {
    // Course selection
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', function() {
            const courseName = this.getAttribute('data-course');
            localStorage.setItem('selectedCourse', courseName);
            
            // Check if user already has access to Data Science (it's free)
            if (courseName === 'Data Science Fundamentals') {
                const user = JSON.parse(localStorage.getItem('currentUser'));
                user.courses = user.courses || [];
                if (!user.courses.includes(courseName)) {
                    user.courses.push(courseName);
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
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
    
    // Check course access
    const protectedCourses = ['youtube-automation.html', 'digital-marketing.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedCourses.includes(currentPage)) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const courseName = currentPage === 'youtube-automation.html' ? 
            'YouTube Automation' : 'Digital Marketing';
            
        if (!user.courses || !user.courses.includes(courseName)) {
            alert('You do not have access to this course. Please enter a valid access code.');
            window.location.href = 'access-code.html';
        }
    }
}