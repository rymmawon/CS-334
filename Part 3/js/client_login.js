let db;
const request = indexedDB.open("TeaShopDB", 2);
request.onupgradeneeded = function (event) {
    db = event.target.result;
    // Create the "users" object store if it doesn't exist.
    if (!db.objectStoreNames.contains("users")) {
        let userStore = db.createObjectStore("users", { keyPath: "email" });
        // Seed the store with a default user credential.
        userStore.add({ email: "user@teashop.com", password: "userpass" });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log("IndexedDB (users) initialized successfully.");
};

request.onerror = function (event) {
    console.error("IndexedDB error:", event.target.errorCode);
};

// Event listener to handle form submission
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('form').addEventListener('submit', function (event) {
        event.preventDefault();  // Prevent the default form submission

        // Retrieve input values from the form
        const emailInput = document.getElementById('email').value.trim();
        const passwordInput = document.getElementById('password').value;

        // Basic client-side validation: both fields must be filled
        if (!emailInput || !passwordInput) {
            alert('Please fill in both email and password.');
            return;
        }

        // Start a read-only transaction on the "users" object store
        const transaction = db.transaction(["users"], "readonly");
        const store = transaction.objectStore("users");
        const getRequest = store.get(emailInput);

        getRequest.onsuccess = function (event) {
            const user = getRequest.result;
            if (user && user.password === passwordInput) {
                // Credentials are correct; set session storage flags
                sessionStorage.setItem("userLoggedIn", "true");
                sessionStorage.setItem("userEmail", emailInput);
                // Redirect the user to the user dashboard (once it is created)
                window.location.href = "index.html";
            } else {
                alert("Invalid email or password. Please try again.");
            }
        };

        getRequest.onerror = function (event) {
            console.error("Error retrieving user:", event.target.errorCode);
            alert("Error during login. Please try again later.");
        };
    });
});
