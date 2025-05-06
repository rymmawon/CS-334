// DOM elements
let teaTable;
let addTeaButton;
let teaTableBody;
let authToken;

// Initialize when DOM
document.addEventListener('DOMContentLoaded', function() {
    authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = '/admin/login';
        return;
    }

    teaTableBody = document.querySelector('.table tbody');
    if (!teaTableBody) {
        console.error('Could not find table body element');
        return;
    }

    // Load products when page loads
    loadTeaProducts();

    const addTeaButton = document.getElementById('addTeaBtn');
    if (addTeaButton) {
        addTeaButton.addEventListener('click', function() {
            document.getElementById('teaForm').reset();
            document.getElementById('teaId').value = '';
            document.getElementById('teaModalLabel').textContent = 'Add New Tea Product';
            const modal = new bootstrap.Modal(document.getElementById('teaModal'));
            modal.show();
        });
    }

    const saveTeaButton = document.getElementById('saveTeaBtn');
    if (saveTeaButton) {
        saveTeaButton.addEventListener('click', async function() {
            const form = document.getElementById('teaForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const teaData = {
                name: document.getElementById('teaName').value,
                price: parseFloat(document.getElementById('teaPrice').value),
                stock: parseInt(document.getElementById('teaStock').value),
                image_url: document.getElementById('teaImage').value || null
            };

            const teaId = document.getElementById('teaId').value;
            let success = false;

            try {
                if (teaId) {
                    success = await updateTeaProduct(teaId, teaData);
                } else {
                    success = await addTeaProduct(teaData);
                }

                if (success) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('teaModal'));
                    modal.hide();
                    await loadTeaProducts();
                }
            } catch (error) {
                console.error('Error saving product:', error);
                displayErrorMessage('Failed to save product. Please try again.');
            }
        });
    }

    teaTableBody.addEventListener('click', function(e) {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        
        if (editBtn) {
            const row = editBtn.closest('tr');
            const id = row.dataset.id;
            editTeaProduct(id);
        } else if (deleteBtn) {
            const row = deleteBtn.closest('tr');
            const id = row.dataset.id;
            if (confirm('Are you sure you want to delete this product?')) {
                deleteTeaProduct(id);
            }
        }
    });
});

// Load all tea products from the API
async function loadTeaProducts() {
    try {
        const response = await fetch('/api/products', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return;
            }
            throw new Error('Failed to load products');
        }
        const products = await response.json();
        displayAllTeaProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        displayErrorMessage('Failed to load products. Please try again.');
    }
}

// Display the teas in the table
function displayAllTeaProducts(products) {
    teaTableBody.innerHTML = '';
    
    if (products.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center">No products available</td>
        `;
        teaTableBody.appendChild(row);
        return;
    }
    
    products.forEach(tea => {
        const row = createTeaTableRow(tea);
        teaTableBody.appendChild(row);
    });
}

// Create a table row for a tea product
function createTeaTableRow(tea) {
    const row = document.createElement('tr');
    row.dataset.id = tea.id;
    
    const stockStatus = tea.stock > 0 ? 'In Stock' : 'Out of Stock';
    row.innerHTML = `
    <td>${tea.id}</td>
    <td><img src="${tea.image_url}" alt="${tea.name}" style="width: 50px; height: 50px;" class="rounded" onerror="this.style.display='none'"></td>
    <td><span class="fw-bold">${tea.name}</span></td>
    <td>$${tea.price.toFixed(2)}</td>
    <td>${stockStatus}</td>
    <td>
        <button class="btn btn-sm edit-btn"><img src="/static/images/edit.png" alt="Edit" style="width: 20px;"></button>
        <button class="btn btn-sm delete-btn"><img src="/static/images/delete.png" alt="Delete" style="width: 20px;"></button>
    </td>
    `;
    return row;
}

// Function to edit a tea product
async function editTeaProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return;
            }
            throw new Error('Failed to get product');
        }
        
        const tea = await response.json();
        if (tea) {
            document.getElementById('teaId').value = tea.id;
            document.getElementById('teaName').value = tea.name;
            document.getElementById('teaPrice').value = tea.price;
            document.getElementById('teaStock').value = tea.stock;
            document.getElementById('teaImage').value = tea.image_url || '';
            document.getElementById('teaModalLabel').textContent = 'Edit Tea Product';

            const modal = new bootstrap.Modal(document.getElementById('teaModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error getting product:', error);
        displayErrorMessage('Failed to load product for editing. Please try again.');
    }
}

// Add a new product to the database
async function addTeaProduct(productData) {
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(productData)
        });
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return false;
            }
            throw new Error('Failed to add product');
        }
        return true;
    } catch (error) {
        console.error('Error adding product:', error);
        displayErrorMessage('Failed to add product. Please try again.');
        return false;
    }
}
// Update an existing product
async function updateTeaProduct(id, productData) {
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(productData)
        });
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return false;
            }
            throw new Error('Failed to update product');
        }
        return true;
    } catch (error) {
        console.error('Error updating product:', error);
        displayErrorMessage('Failed to update product. Please try again.');
        return false;
    }
}
// Delete a tea
async function deleteTeaProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login';
                return false;
            }
            throw new Error('Failed to delete product');
        }
        await loadTeaProducts();
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        displayErrorMessage('Failed to delete product. Please try again.');
        return false;
    }
}

function displayErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '1000';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}