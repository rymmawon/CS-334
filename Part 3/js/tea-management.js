// Check if the IndexedDB is supported
if (!window.indexedDB) {
    console.log("Your browsert doesn't support IndexedDB");
}

// Initialize database
let db;
const DB_NAME = 'GreenLeafDB';
const STORE_NAME = 'greenLeaf';
const DB_VERSION = 1;

// DOM elements
let teaTable;
let addTeaButton;
let teaTableBody;

// Initialize database
document.addEventListener('DOMContentLoaded', () => {
    teaTable = document.querySelector('.table');
    teaTableBody = teaTable.querySelector('tbody');
    addTeaButton = document.querySelector('.btn-primary');
    addTeaButton.addEventListener('click', showAddTeaForm);
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
        console.log(`Database error: ${event.target.errorCode}`);
    }
    
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
        checkAndLoadInitialData();
    };
});

// Load initial data
function checkAndLoadInitialData() {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const countRequest = store.count();
    
    countRequest.onsuccess = () => {
        if (countRequest.result === 0) {
            const initialTeas = [
                {
                    id: 1,
                    image: 'images/tea-1.jpg',
                    name: 'Black Tea',
                    price: 8.99,
                    stockStatus: 'In Stock'
                },
                {
                    id: 2,
                    image: 'images/tea-2.jpg',
                    name: 'Green Tea',
                    price: 10.99,
                    stockStatus: 'In Stock'
                },
                {
                    id: 3,
                    image: 'images/tea-3.jpg',
                    name: 'White Tea',
                    price: 12.50,
                    stockStatus: 'In Stock'
                },
                {
                    id: 4,
                    image: 'images/tea-4.jpg',
                    name: 'Chamomile Tea',
                    price: 7.99,
                    stockStatus: 'In Stock'
                },
                {
                    id: 5,
                    image: 'images/tea-5.jpg',
                    name: 'Mint Tea',
                    price: 6.99,
                    stockStatus: 'In Stock'
                },
                {
                    id: 6,
                    image: 'images/tea-6.jpg',
                    name: 'Hibiscus Tea',
                    price: 8.50,
                    stockStatus: 'Out of Stock'
                },
                {
                    id: 7,
                    image: 'images/tea-7.jpg',
                    name: 'Oolong Tea',
                    price: 14.99,
                    stockStatus: 'In Stock'
                },
                {
                    id: 8,
                    image: 'images/tea-8.jpg',
                    name: 'Matcha Tea',
                    price: 18.99,
                    stockStatus: 'In Stock'
                }
            ];
            
            initialTeas.forEach(tea => addTeaProduct(tea));
        }
        displayAllTeaProducts();
    };
}

// Display the teas in the table
function displayAllTeaProducts() {
    teaTableBody.innerHTML = '';
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const tea = cursor.value;
            const row = createTeaTableRow(tea);
            teaTableBody.appendChild(row);
            cursor.continue();
        }
    };
    
    request.onerror = (event) => {
        console.error('Error fetching tea products:', event.target.error);
    };
}

//Create a table row for a tea product
function createTeaTableRow(tea) {
    const row = document.createElement('tr');
    row.dataset.id = tea.id;
    
    row.innerHTML = `
    <td>${tea.id}</td>
    <td><img src="${tea.image}" alt="${tea.name}" style="width: 50px; height: 50px;" class="rounded"></td>
    <td><span class="fw-bold">${tea.name}</span></td>
    <td>$${tea.price.toFixed(2)}</td>
    <td>${tea.stockStatus}</td>
    <td>
        <button class="btn btn-sm edit-btn"><img src="images/edit.png" alt="Edit" style="width: 20px;"></button>
        <button class="btn btn-sm delete-btn"><img src="images/delete.png" alt="Delete" style="width: 20px;"></button>
    </td>
    `;
    row.querySelector('.edit-btn').addEventListener('click', () => showEditTeaForm(tea.id));
    row.querySelector('.delete-btn').addEventListener('click', () => confirmDeleteTea(tea.id));
    return row;
}

//Add a new product to the database
function addTeaProduct(tea, callback) {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(tea);
    request.onsuccess = () => {
        displayAllTeaProducts();
        if (callback) callback();
    }
    request.onerror = (event) => {
        console.error('Error adding tea product:', event.target.error);
    };
}

//  Update an existing product
function updateTeaProduct(tea, callback) {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(tea);
    request.onsuccess = () => {
        displayAllTeaProducts();
        if (callback) callback();
    };
    request.onerror = (event) => {
        console.error('Error updating tea product:', event.target.error);
    };
}

// Delete a tea
function deleteTeaProduct(id) {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => {
        displayAllTeaProducts();
    };
    
    request.onerror = (event) => {
        console.error('Error deleting tea product:', event.target.error);
    };
}

// Get a tea product by ID
function getTeaProduct(id, callback) {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.get(id);
    
    request.onsuccess = (event) => {
        callback(event.target.result);
    };
    request.onerror = (event) => {
        console.error('Error getting tea product:', event.target.error);
        callback(null);
    };
}

//Form to add a new tea
function showAddTeaForm() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'addTeaModal';
    modal.tabIndex = '-1';
    modal.setAttribute('aria-labelledby', 'addTeaModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title" id="addTeaModalLabel">Add New Tea Product</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="addTeaForm">
                        <div class="mb-3">
                            <label for="teaName" class="form-label">Tea Name</label>
                            <input type="text" class="form-control" id="teaName" required>
                        </div>
                        <div class="mb-3">
                            <label for="teaPrice" class="form-label">Price</label>
                            <input type="number" class="form-control" id="teaPrice" step="0.01" min="0" required>
                        </div>
                        <div class="mb-3">
                            <label for="teaStock" class="form-label">Stock Status</label>
                            <select class="form-control" id="teaStock" required>
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="teaImage" class="form-label">Image Path</label>
                            <input type="text" class="form-control" id="teaImage" value="images/tea-default.jpg">
                            <small class="text-muted">Enter path to image (e.g., images/tea-1.jpg)</small>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" id="submitAddTea">Add Tea</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    document.getElementById('submitAddTea').addEventListener('click', () => {
        const form = document.getElementById('addTeaForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const newTea = {
            name: document.getElementById('teaName').value,
            price: parseFloat(document.getElementById('teaPrice').value),
            stockStatus: document.getElementById('teaStock').value,
            image: document.getElementById('teaImage').value
        };

        addTeaProduct(newTea);
        modalInstance.hide();
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
            displayAllTeaProducts();
        });
    });
    
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}
// Form to edit an existing tea
function showEditTeaForm(id) {
    getTeaProduct(id, (tea) => {
        if (!tea) {
            alert('Tea product not found');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'editTeaModal';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-labelledby', 'editTeaModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title" id="editTeaModalLabel">Edit Tea Product</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editTeaForm">
                            <div class="mb-3">
                                <label for="editTeaName" class="form-label">Tea Name</label>
                                <input type="text" class="form-control" id="editTeaName" value="${tea.name}" required>
                            </div>
                            <div class="mb-3">
                                <label for="editTeaPrice" class="form-label">Price</label>
                                <input type="number" class="form-control" id="editTeaPrice" value="${tea.price}" step="0.01" min="0" required>
                            </div>
                            <div class="mb-3">
                                <label for="editTeaStock" class="form-label">Stock Status</label>
                                <select class="form-control" id="editTeaStock" required>
                                    <option value="In Stock" ${tea.stockStatus === 'In Stock' ? 'selected' : ''}>In Stock</option>
                                    <option value="Out of Stock" ${tea.stockStatus === 'Out of Stock' ? 'selected' : ''}>Out of Stock</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="editTeaImage" class="form-label">Image Path</label>
                                <input type="text" class="form-control" id="editTeaImage" value="${tea.image}">
                                <small class="text-muted">Enter path to image (e.g., images/tea-1.jpg)</small>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="submitEditTea">Save Changes</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        document.getElementById('submitEditTea').addEventListener('click', () => {
            const form = document.getElementById('editTeaForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            const updatedTea = {
                id: tea.id,
                name: document.getElementById('editTeaName').value,
                price: parseFloat(document.getElementById('editTeaPrice').value),
                stockStatus: document.getElementById('editTeaStock').value,
                image: document.getElementById('editTeaImage').value
            };

            updateTeaProduct(updatedTea);
            modalInstance.hide();
        });
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    });
}
//Confirming before deleting a tea product
function confirmDeleteTea(teaId) {
    getTeaProduct(teaId, (tea) => {
        if (!tea) {
            alert('Tea product not found');
            return;
        }
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'deleteTeaModal';
        modal.tabIndex = '-1';
        modal.setAttribute('aria-labelledby', 'deleteTeaModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="deleteTeaModalLabel">Confirm Delete</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete "${tea.name}"?</p>
                        <p>This action cannot be undone.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirmDeleteTea">Delete</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        document.getElementById('confirmDeleteTea').addEventListener('click', () => {
            deleteTeaProduct(teaId);
            modalInstance.hide();
        });
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    });
}