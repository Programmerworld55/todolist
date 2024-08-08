const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
    event.preventDefault();
});

// Open (or create) the database
let db;
const request = indexedDB.open("UserDatabase", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("email", "email", { unique: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
};

request.onerror = function(event) {
    console.log("Error opening database:", event.target.errorCode);
};

// Validate user input
function validateUserInput(name, email, phone, password) {
    let isValid = true;
    let message = "";

    // Check for empty name
    if (!name.trim()) {
        isValid = false;
        message += "Name cannot be empty.\n";
    }

    // Check password length
    if (password.length < 8) {
        isValid = false;
        message += "Password must be at least 8 characters long.\n";
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        isValid = false;
        message += "Invalid email format.\n";
    }

    // Validate phone number (example: simple numeric check)
    const phonePattern = /^\d+$/;
    if (!phonePattern.test(phone) || phone.length < 10) {
        isValid = false;
        message += "Phone number must be numeric and at least 10 digits long.\n";
    }

    if (!isValid) {
        alert(message);
    }

    return isValid;
}

// Save user data to IndexedDB and localStorage on registration
function registerUser() {
    const username = document.getElementById("register_name").value;
    const useremail = document.getElementById("register_email").value;
    const userph = document.getElementById("register_ph").value;
    const userpass = document.getElementById("register_password").value;

    // Validate input
    if (validateUserInput(username, useremail, userph, userpass)) {
        const user_data = {
            "name": username,
            "email": useremail,
            "userph": userph,
            "userpass": userpass
        };

        const transaction = db.transaction(["users"], "readwrite");
        const objectStore = transaction.objectStore("users");
        const request = objectStore.add(user_data);

        request.onsuccess = function() {
            alert('User registered successfully!');
            localStorage.setItem('username', username);  // Save username
            window.location.href = 'todo_list.html';  // Redirect to todolist.html
        };

        request.onerror = function(event) {
            alert('Error registering user:', event.target.errorCode);
        };
    }
}

// Retrieve user data from IndexedDB and check login
function loginUser() {
    const username = document.getElementById("login_name").value;
    const userpass = document.getElementById("login_password").value;

    const transaction = db.transaction(["users"], "readonly");
    const objectStore = transaction.objectStore("users");
    const index = objectStore.index("name");
    const request = index.get(username);

    request.onsuccess = function(event) {
        const userData = event.target.result;

        if (userData) {
            if (userData.userpass === userpass) {
                alert('Login successful!');
                localStorage.setItem('username', username);  // Save username
                window.location.href = 'todo_list.html';  // Redirect to todolist.html
            } else {
                alert('Invalid name or password.');
            }
        } else {
            alert('No user data found. Please register.');
        }
    };

    request.onerror = function(event) {
        alert('Error logging in:', event.target.errorCode);
    };
}

function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = passwordInput.nextElementSibling;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.src = "eye-icon.png";
    } else {
        passwordInput.type = "password";
        eyeIcon.src = "close.png";
    }
}
