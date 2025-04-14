
// Check if the IndexedDB is supported
if (!window.indexedDB) {
    console.log("Your browsert doesn't support IndexedDB");
}

// Initialize database
let db;
const DB_NAME = 'GreenLeafDB';
const STORE_NAME = 'greenLeaf';
const DB_VERSION = 1;

//DOM elements
let productContainer;

document.addEventListener('DOMContentLoaded', () => {
    
    productContainer = document.querySelector('.row-cols-1');
    productContainer.innerHTML = '';
    
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
        loadProducts();
    };
});
// Product loading from db
function loadProducts() {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = (event) => {
        const products = event.target.result;
        
        if (products.length === 0) {
            displayNoProductsMessage();
        } else {
            products.forEach(product => {
                if (product.stockStatus !== 'Out of Stock') {
                    displayProduct(product);
                }
            });
        }
    };
    
    request.onerror = (event) => {
        console.error('Error fetching products:', event.target.error);
    };
}

// Product card
function displayProduct(product) {
    const col = document.createElement('div');
    col.className = 'col';
    
    col.innerHTML = `
        <div class="card text-center" data-product-id="${product.id}">
            <div class="image-container">
                <img src="${product.image}" class="card-img-top w-100 h-100 object-fit-cover" alt="${product.name}">
            </div>
            <div class="card-body">
                <h6 class="card-title">${product.name}</h6>
                <p class="card-text">$${product.price.toFixed(2)}</p>
                <button class="btn btn-primary add-to-cart-btn">Add To Cart</button>
            </div>
        </div>
    `;
    const addToCartBtn = col.querySelector('.add-to-cart-btn');
    addToCartBtn.addEventListener('click', (event) => {
        addToCart(product.id);
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Added!';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-success');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-primary');
        }, 1500);
    });
    
    productContainer.appendChild(col);
}

function displayNoProductsMessage() {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'col-12 text-center py-5';
    messageContainer.innerHTML = `
        <h3>No products available at this time</h3>
        <p>Please check back later for our tea selection.</p>
    `;
    productContainer.appendChild(messageContainer);
}

function addToCart(productId){
    cart.push(productId);
}
;