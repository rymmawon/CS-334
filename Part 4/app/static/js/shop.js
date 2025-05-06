// DOM elements
let productContainer;
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
    
    productContainer = document.getElementById('product-list');
    
    if (productContainer) {
        productContainer.innerHTML = '';
        loadProducts();
    }
});

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await response.json();
        
        if (products.length === 0) {
            displayNoProductsMessage();
        } else {
            productContainer.innerHTML = ''; 
            products.forEach(product => {
                displayProduct(product);
            });
        }
    } catch (error) {
        console.error('Error loading products:', error);
        displayErrorMessage('Failed to load products. Please refresh the page.');
    }
}
//Product cart
function displayProduct(product) {
    const col = document.createElement('div');
    col.className = 'col';
    
    // Check if product is in cart
    const cartItem = cart.find(item => item.id === product.id);
    const isInCart = cartItem !== undefined;
    const currentQuantity = isInCart ? cartItem.quantity : 1;
    const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
    
    col.innerHTML = `
        <div class="card text-center h-100" data-product-id="${product.id}">
            <div class="image-container" style="height: 200px; overflow: hidden;">
                <img src="${product.image_url}" class="card-img-top h-100 w-100 object-fit-cover" alt="${product.name}" onerror="this.onerror=null; this.src='/static/images/placeholder.jpg';">
            </div>
            <div class="card-body d-flex flex-column">
                <h6 class="card-title">${product.name}</h6>
                <p class="card-text fw-bold">$${product.price.toFixed(2)}</p>
                <p class="stock-status ${stockStatus === 'In Stock' ? 'text-success' : 'text-danger'}">${stockStatus}</p>
                <div class="quantity-controls mt-2 mb-3">
                    <div class="input-group justify-content-center">
                        <button class="btn btn-outline-secondary quantity-decrease" type="button">-</button>
                        <input type="number" class="form-control text-center quantity-input" value="${currentQuantity}" min="1" max="10" style="max-width: 60px;">
                        <button class="btn btn-outline-secondary quantity-increase" type="button">+</button>
                    </div>
                </div>
                <button class="btn btn-primary mt-auto add-to-cart-btn" 
                  ${stockStatus === 'Out of Stock' ? 'disabled' : ''}>
                    Add To Cart
                </button>
            </div>
        </div>
    `;
    
    const addToCartBtn = col.querySelector('.add-to-cart-btn');
    const quantityInput = col.querySelector('.quantity-input');
    const decreaseBtn = col.querySelector('.quantity-decrease');
    const increaseBtn = col.querySelector('.quantity-increase');
    
    decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            if (isInCart) {
                addToCart(product.id, currentValue - 1);
            }
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 10) {
            quantityInput.value = currentValue + 1;
            if (isInCart) {
                addToCart(product.id, currentValue + 1);
            }
        }
    });
    
    quantityInput.addEventListener('change', () => {
        const value = parseInt(quantityInput.value) || 1;
        const validValue = Math.min(Math.max(value, 1), 10);
        quantityInput.value = validValue;
        if (isInCart) {
            addToCart(product.id, validValue);
        }
    });
    
    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value) || 1;
        addToCartBtn.disabled = true;
        
        if (!isInCart) {
            addToCart(product.id, quantity);
        } else {
            // Remove from cart
            removeFromCart(product.id);
        }
        setTimeout(() => {
            addToCartBtn.disabled = false;
        }, 500);
    });
    
    productContainer.appendChild(col);
}

function displayNoProductsMessage() {
    productContainer.innerHTML = `
        <div class="col-12 text-center">
            <p class="text-muted">No products available at the moment.</p>
        </div>
    `;
}

function displayErrorMessage(message) {
    productContainer.innerHTML = `
        <div class="col-12 text-center">
            <p class="text-danger">${message}</p>
        </div>
    `;
}

function addToCart(productId, quantity = 1) {
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Update quantity if product is in cart
        existingItem.quantity = quantity;
    } else {
        // Add new item to cart
        cart.push({
            id: productId,
            quantity: quantity
        });
    }
    
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
}