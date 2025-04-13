
// Open (or create) the IndexedDB database "TeaShopDB" with an object store named "managers"
let db;
const request = indexedDB.open("TeaShopDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    // Create an object store with the keyPath set to "email"
    let managerStore = db.createObjectStore("managers", { keyPath: "email" });
    // Seed the store with the hard-coded manager credentials
    managerStore.add({ email: "manager@teashop.com", password: "secure123" });
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log("IndexedDB initialized successfully.");
};

request.onerror = function (event) {
    console.error("IndexedDB error:", event.target.errorCode);
};

// Use DOMContentLoaded to ensure the form exists before attaching event listeners.
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('form').addEventListener('submit', function (event) {
        event.preventDefault();  // Prevent default form submission

        // Retrieve input values
        const emailInput = document.getElementById('email').value.trim();
        const passwordInput = document.getElementById('password').value;

        // Basic validation
        if (!emailInput || !passwordInput) {
            alert('Please fill in both email and password.');
            return;
        }

        // Open a read-only transaction and query the "managers" object store
        const transaction = db.transaction(["managers"], "readonly");
        const store = transaction.objectStore("managers");
        const getRequest = store.get(emailInput);

        getRequest.onsuccess = function (event) {
            const manager = getRequest.result;
            if (manager && manager.password === passwordInput) {
                // If credentials match, set sessionStorage and redirect to the dashboard
                sessionStorage.setItem("managerLoggedIn", "true");
                sessionStorage.setItem("managerEmail", emailInput);
                window.location.href = "admin_dashboard.html";
            } else {
                alert("Invalid email or password. Please try again.");
            }
        };

        getRequest.onerror = function (event) {
            console.error("Error retrieving manager:", event.target.errorCode);
            alert("Error during login. Please try again later.");
        };
    });
});
