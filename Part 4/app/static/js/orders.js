document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});

async function loadOrders() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/admin/login';
            return;
        }

        const response = await fetch('/api/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return;
            }
            throw new Error('Failed to fetch orders');
        }
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        displayErrorMessage('Failed to load orders. Please refresh the page.');
    }
}

function displayOrders(orders) {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        const itemsList = order.items.map(item => 
            `${item.product.name} (${item.quantity}x)`
        ).join('<br>');
        
        const orderDate = new Date(order.created_at);
        const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();
        
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customer_name}</td>
            <td>${order.email}</td>
            <td>${itemsList}</td>
            <td>$${order.total_amount.toFixed(2)}</td>
            <td>${formattedDate}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function displayErrorMessage(message) {
    const tableBody = document.getElementById('orders-table-body');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    ${message}
                </td>
            </tr>
        `;
    }
} 