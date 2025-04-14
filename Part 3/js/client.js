let cart = [];

let cartContainer;

cartContainer = document.querySelector('.products');
//cartContainer.innerHTML = '';

let subtotal = 0; 
let totalPrice = 0;

let db;
let db_trans;
const DB_NAME = 'GreenLeafDB';
const STORE_NAME = 'greenLeaf';
const DB_VERSION = 1;

// Product loading from db
function loadCart() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        displayErrorMessage('Could not load products. Please try again later.');
    };
    
    request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            store.createIndex('name', 'name', { unique: false });
            store.createIndex('price', 'price', { unique: false });
            store.createIndex('stockStatus', 'stockStatus', { unique: false });
        }
    };
    request.onsuccess = (event) => {
        db = event.target.result;
    };

    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    for (let i = 0; i < cart.length; i++){
        console.log(cart[i]);
        const request = store.get(cart[i]);
        request.onsuccess = (event) => {
            const product = event.target.result;
            if (product.stockStatus !== 'Out of Stock') {
                displayProductInCart(product);
                subtotal += product.price;
            }
        };
        request.onerror = (event) => {
            console.error('Error fetching products:', event.target.error);
        };
    }
}

function displayProductInCart(product) {
    const col = document.createElement('div');
    col.className = 'col';
    
    col.innerHTML = `
        <div class="product">
                <img src="${product.image}" width="60px" height="auto">
            <div>
                <span>${product.name}</span>
            </div>
            <div class="number-control">
                <div class="number-left"></div>
                <input type="number" name="number" class="number-quantity">
                <div class="number-right"></div>
            </div>
            <label class="price small">${product.price.toFixed(2)}</label>
            </div>
    `;
    cartContainer.appendChild(col);
}

function calcSub(){
    return subtotal;
}

function calcTotal(){
    //add subtotal, calculate and add taxes
    totalPrice = subtotal * 1.07125
    return totalPrice;
}

//Create transactions DB
const request_Trans = indexedDB.open(DB_NAME, DB_VERSION);
request_Trans.onupgradeneeded = function (event) {
    db_trans = event.target.result;
    // Create the transactions object store if it doesn't exist.
    if (!db_trans.objectStoreNames.contains("transactions")) {
        let userStore = db_trans.createObjectStore("transactions", { keyPath: 'id', autoIncrement: true });
        
        userStore.createIndex('customerName', 'customerName', { unique: false });
        userStore.createIndex('totalPrice', 'totalPrice', { unique: false });
        userStore.createIndex('cardNumber', 'cardNumber', { unique: false });
        userStore.createIndex('items', 'items', { unique: false })

        userStore.add({ customerName: "Alex Adams", totalPrice: 10, cardNumber:'0000000000', items: 2 });
}
};

request_Trans.onsuccess = function (event) {
db_trans = event.target.result;
console.log("IndexedDB (transactions) initialized successfully.");
};

request_Trans.onerror = function (event) {
console.error("IndexedDB error:", event.target.errorCode);
};

function submitPayment(){
    
    const payment = {
        customerName: document.getElementById(name_field),
        totalPrice:calcTotal(),
        cardNumber:document.getElementById(credit_field),
        items: cart.length
    }
    const pay = db_trans.transaction('transactions', 'readwrite');
    const store = pay.objectStore('transactions');
    const request_pay = store.add(payment);
    request_pay.onsuccess = () => {
        alert("Transaction Completed");
        if (callback) callback();
    }
    request_pay.onerror = (event) => {
        console.error('Error Completing Transaction:', event.target.error);
    };
}
