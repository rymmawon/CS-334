let cart = [];
let cartContainer = null;
let subtotal = 0;
let totalPrice = 0;

// Initialize cart 
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    cartContainer = document.querySelector('.products');
    
    if (cartContainer) {
        displayCartItems();
        checkIfCartEmpty();
    }
});


//  Check if cart is empty 
function checkIfCartEmpty() {
    const productsContainer = document.querySelector('.products');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    
    if (emptyCartMessage && (!productsContainer.children.length || cart.length === 0)) {
        emptyCartMessage.style.display = 'block';
    } else if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
    }
}

function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCartItems();
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

async function displayCartItems() {
    if (!cartContainer) {
        console.error("Cart container not found");
        return;
    }
    
    if (!cart || cart.length === 0) {
        checkIfCartEmpty();
        return;
    }
    
    cartContainer.innerHTML = '';
    subtotal = 0;
    
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await response.json();
        const productMap = new Map(products.map(p => [p.id, p]));
        
        // Process each cart item
        for (const cartItem of cart) {
            const product = productMap.get(cartItem.id);
            if (product) {
                if (product.stock_status !== 'Out of Stock') {
                    displayProductInCart(product, cartItem.quantity);
                    subtotal += product.price * cartItem.quantity;
                } else {
                    console.log(`Product ${cartItem.id} is out of stock`);
                    removeFromCart(cartItem.id);
                }
            } else {
                console.log(`Product ${cartItem.id} not found`);
                removeFromCart(cartItem.id);
            }
        }
        
        // Update the total
        updateCartTotal();
        // Check if cart is empty after processing
        setTimeout(() => checkIfCartEmpty(), 100);
    } catch (error) {
        console.error('Error loading cart items:', error);
        displayErrorMessage('Failed to load cart items. Please try again later.');
    }
}

function displayProductInCart(product, quantity) {
    const productElement = document.createElement('div');
    productElement.className = 'product d-flex align-items-center justify-content-between p-3 border-bottom';
    productElement.dataset.id = product.id;
    productElement.dataset.price = product.price.toFixed(2);
    
    productElement.innerHTML = `
        <div class="d-flex align-items-center gap-3" style="flex: 1;">
            <div class="product-info" style="min-width: 150px;">
                <div class="fw-bold">${product.name}</div>
                <div class="text-muted">$${product.price.toFixed(2)} each</div>
            </div>
        </div>
        <div class="d-flex align-items-center gap-3" style="flex: 1; justify-content: flex-end;">
            <div class="number-control d-flex align-items-center">
                <button class="btn btn-outline-secondary btn-sm number-left">-</button>
                <input type="number" name="number" class="form-control text-center number-quantity" value="${quantity}" min="1" max="10" style="width: 50px;">
                <button class="btn btn-outline-secondary btn-sm number-right">+</button>
            </div>
            <div class="price-container text-end" style="min-width: 100px;">
                <div class="price small fw-bold">$${(product.price * quantity).toFixed(2)}</div>
            </div>
            <button class="btn btn-outline-danger btn-sm remove-item ms-2">✕</button>
        </div>
    `;
    
    cartContainer.appendChild(productElement);
    const quantityInput = productElement.querySelector('.number-quantity');
    const decreaseBtn = productElement.querySelector('.number-left');
    const increaseBtn = productElement.querySelector('.number-right');
    const removeBtn = productElement.querySelector('.remove-item');
    
    decreaseBtn.addEventListener('click', () => {
        if (quantityInput.value > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
            updateCartQuantity(product.id, parseInt(quantityInput.value));
            updateItemTotal(productElement);
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        if (quantityInput.value < 10) {
            quantityInput.value = parseInt(quantityInput.value) + 1;
            updateCartQuantity(product.id, parseInt(quantityInput.value));
            updateItemTotal(productElement);
        }
    });
    
    quantityInput.addEventListener('input', () => {
        const newQuantity = Math.min(Math.max(parseInt(quantityInput.value) || 1, 1), 10);
        quantityInput.value = newQuantity;
        updateCartQuantity(product.id, newQuantity);
        updateItemTotal(productElement);
    });
    
    quantityInput.addEventListener('change', () => {
        const newQuantity = Math.min(Math.max(parseInt(quantityInput.value) || 1, 1), 10);
        quantityInput.value = newQuantity;
        updateCartQuantity(product.id, newQuantity);
        updateItemTotal(productElement);
    });
    
    // Add remove item functionality
    removeBtn.addEventListener('click', () => {
        removeFromCart(product.id);
        productElement.remove();
        updateCartTotal();
        checkIfCartEmpty();
    });
}

function updateCartQuantity(productId, newQuantity) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartTotal();
    }
}

function updateItemTotal(productElement) {
    const quantity = parseInt(productElement.querySelector('.number-quantity').value) || 1;
    const unitPrice = parseFloat(productElement.dataset.price);
    const priceLabel = productElement.querySelector('.price.small');
    const itemTotal = unitPrice * quantity;
    priceLabel.textContent = `$${itemTotal.toFixed(2)}`;
    updateCartTotal();
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartTotal();
    }
}

function updateCartTotal() {
    subtotal = 0;
    const products = document.querySelectorAll('.product');
    
    products.forEach(product => {
        const quantity = parseInt(product.querySelector('.number-quantity').value) || 1;
        const unitPrice = parseFloat(product.dataset.price);
        subtotal += unitPrice * quantity;
    });
    
    const taxRate = 0.07125;
    const tax = subtotal * taxRate;
    totalPrice = subtotal + tax;
    
    // Subtotal, tax, and total in the checkout section
    const subtotalElement = document.querySelector('.details span:nth-child(2)');
    const taxElement = document.querySelector('.details span:nth-child(4)');
    const totalElement = document.querySelector('.checkout--footer .price');
    
    if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
    if (totalElement) totalElement.innerHTML = `<sup>$</sup>${totalPrice.toFixed(2)}`;
}

function updateCheckout() {
    updateCartTotal();
}

function calcSub(){
    return subtotal;
}

function calcTotal(){
    //add subtotal, calculate and add taxes
    totalPrice = subtotal * 1.07125;
    return totalPrice;
}

async function submitPayment() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const nameField = document.getElementById('name_field');
    const emailField = document.getElementById('email_field');
    const cardField = document.getElementById('credit_field');
    const expiryField = document.getElementById('password_expir');
    const cvvField = document.getElementById('password_field');
    
    if (!nameField.value || !emailField.value || !cardField.value || !expiryField.value || !cvvField.value) {
        alert('Please fill in all payment details');
        return;
    }
    
    try {
        // Fetch all products to get current prices
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) {
            throw new Error('Failed to fetch products');
        }
        const products = await productsResponse.json();
        const productMap = new Map(products.map(p => [p.id, p]));
        
        // Create order items with current prices
        const orderItems = cart.map(item => {
            const product = productMap.get(item.id);
            return {
                product_id: item.id,
                quantity: item.quantity,
                price: product.price
            };
        });
        
        // Create order
        const orderResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer_name: nameField.value,
                email: emailField.value,
                total_amount: totalPrice,
                items: orderItems
            })
        });
        
        if (!orderResponse.ok) {
            throw new Error('Failed to create order');
        }
        
        localStorage.removeItem('cart');
        alert('Order placed successfully!');
        window.location.href = '/shop';
    } catch (error) {
        console.error('Error submitting payment:', error);
        alert('Failed to place order. Please try again.');
    }
}