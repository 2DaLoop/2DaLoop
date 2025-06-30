class EquipmentInventory {
    constructor() {
        this.equipmentData = [
            { category: 'Desktops', description: 'Desktop PCs' },
            { category: 'Laptops', description: 'Laptop PCs' },
            { category: 'Network Devices', description: 'Switches and Routers' },
            { category: 'Telecom', description: 'Switches and Routers' },
            { category: 'Servers', description: 'Towers, Rackmount, or Blade' }
        ];

        this.sampleData = [
            { quantity: 25, age: 3.5 },
            { quantity: 40, age: 2.1 },
            { quantity: 8, age: 5.2 },
            { quantity: 12, age: 4.8 },
            { quantity: 6, age: 6.3 }
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupInputValidation();
        this.updateAllStatus();
    }

    bindEvents() {
        // Clear All Data button
        const clearBtn = document.querySelector('.clear-btn');
        clearBtn.addEventListener('click', () => this.clearAllData());

        // Import Data button
        const importBtn = document.querySelector('.import-btn');
        importBtn.addEventListener('click', () => this.importData());

        // Generate Sample Data button
        const generateBtn = document.querySelector('.generate-btn');
        generateBtn.addEventListener('click', () => this.generateSampleData());

        // Calculate button
        const calculateBtn = document.querySelector('.calculate-btn');
        calculateBtn.addEventListener('click', () => this.calculateTotals());

        // Input change events
        const inputs = document.querySelectorAll('.quantity-input, .age-input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updateRowStatus(input));
            input.addEventListener('blur', () => this.validateInput(input));
        });
    }

    setupInputValidation() {
        const inputs = document.querySelectorAll('.quantity-input, .age-input');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                // Allow only numbers, decimal point, and control keys
                const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];
                const isNumber = /[0-9]/.test(e.key);
                const isDecimal = e.key === '.' && !input.value.includes('.');

                if (!isNumber && !isDecimal && !allowedKeys.includes(e.key)) {
                    e.preventDefault();
                }
            });
        });
    }

    clearAllData() {
        // Clear all input fields
        const inputs = document.querySelectorAll('.quantity-input, .age-input');
        inputs.forEach(input => {
            input.value = '';
        });

        // Reset all status displays
        this.updateAllStatus();

        // Show confirmation message
        this.showMessage('All data has been cleared successfully!', 'success');
    }

    importData() {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.csv,.json,.txt';

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // For demo purposes, we'll simulate importing data
                this.simulateImport(file.name);
            }
        });

        fileInput.click();
    }

    simulateImport(fileName) {
        // Simulate file processing delay
        this.showMessage('Importing data from ' + fileName + '...', 'info');

        setTimeout(() => {
            // Populate with sample data as if imported
            this.populateData(this.sampleData);
            this.showMessage('Data imported successfully from ' + fileName + '!', 'success');
        }, 1500);
    }

    generateSampleData() {
        this.populateData(this.sampleData);
        this.showMessage('Sample data generated successfully!', 'success');
    }

    populateData(data) {
        const quantityInputs = document.querySelectorAll('.quantity-input');
        const ageInputs = document.querySelectorAll('.age-input');

        data.forEach((item, index) => {
            if (quantityInputs[index]) {
                quantityInputs[index].value = item.quantity;
            }
            if (ageInputs[index]) {
                ageInputs[index].value = item.age;
            }
        });

        this.updateAllStatus();
    }

    calculateTotals() {
        const quantityInputs = document.querySelectorAll('.quantity-input');
        const ageInputs = document.querySelectorAll('.age-input');

        let totalQuantity = 0;
        let totalWeightedAge = 0;
        let validEntries = 0;

        quantityInputs.forEach((input, index) => {
            const quantity = parseFloat(input.value) || 0;
            const age = parseFloat(ageInputs[index].value) || 0;

            if (quantity > 0) {
                totalQuantity += quantity;
                totalWeightedAge += quantity * age;
                validEntries++;
            }
        });

        const averageAge = totalQuantity > 0 ? (totalWeightedAge / totalQuantity).toFixed(1) : 0;

        // Show calculation results
        const message = `
            <strong>Calculation Results:</strong><br>
            Total Equipment: ${totalQuantity} items<br>
            Categories with data: ${validEntries}<br>
            Average Age: ${averageAge} years
        `;

        this.showMessage(message, 'info', 5000);

        // Update all status displays
        this.updateAllStatus();
    }

    updateRowStatus(changedInput) {
        const row = changedInput.closest('.equipment-row');
        const quantityInput = row.querySelector('.quantity-input');
        const statusInfo = row.querySelector('.status-info');
        const itemCount = statusInfo.querySelector('.item-count');
        const statusBadge = statusInfo.querySelector('.status-badge');

        const quantity = parseInt(quantityInput.value) || 0;

        // Update item count
        itemCount.textContent = `${quantity} items`;

        // Update status badge
        this.updateStatusBadge(statusBadge, quantity);
    }

    updateAllStatus() {
        const rows = document.querySelectorAll('.equipment-row');
        rows.forEach(row => {
            const quantityInput = row.querySelector('.quantity-input');
            const statusInfo = row.querySelector('.status-info');
            const itemCount = statusInfo.querySelector('.item-count');
            const statusBadge = statusInfo.querySelector('.status-badge');

            const quantity = parseInt(quantityInput.value) || 0;

            itemCount.textContent = `${quantity} items`;
            this.updateStatusBadge(statusBadge, quantity);
        });
    }

    updateStatusBadge(badge, quantity) {
        // Remove existing status classes
        badge.classList.remove('empty-status', 'low-status', 'normal-status', 'high-status');

        if (quantity === 0) {
            badge.textContent = 'Empty';
            badge.classList.add('empty-status');
        } else if (quantity <= 5) {
            badge.textContent = 'Low';
            badge.classList.add('low-status');
        } else if (quantity <= 20) {
            badge.textContent = 'Normal';
            badge.classList.add('normal-status');
        } else {
            badge.textContent = 'High';
            badge.classList.add('high-status');
        }
    }

    validateInput(input) {
        const value = parseFloat(input.value);

        if (input.value && (isNaN(value) || value < 0)) {
            input.style.borderColor = '#ef4444';
            this.showMessage('Please enter a valid positive number', 'error', 3000);
        } else {
            input.style.borderColor = '#d1d5db';
        }
    }

    showMessage(message, type = 'info', duration = 3000) {
        // Remove existing message if any
        const existingMessage = document.querySelector('.inventory-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `inventory-message ${type}-message`;
        messageDiv.innerHTML = message;

        // Insert message at the top of the container
        const container = document.querySelector('.equipment-inventory-container');
        container.insertBefore(messageDiv, container.firstChild);

        // Auto-remove message after duration
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, duration);
    }
}

// Initialize the inventory system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EquipmentInventory();
});

// Add some utility functions for potential future use
window.EquipmentInventoryUtils = {
    exportData: function() {
        const data = [];
        const rows = document.querySelectorAll('.equipment-row');

        rows.forEach((row, index) => {
            const categoryName = row.querySelector('.category-name').textContent;
            const description = row.querySelector('.equipment-description').textContent;
            const quantity = row.querySelector('.quantity-input').value || '0';
            const age = row.querySelector('.age-input').value || '0';

            data.push({
                category: categoryName,
                description: description,
                quantity: parseInt(quantity),
                age: parseFloat(age)
            });
        });

        return data;
    },

    downloadCSV: function() {
        const data = this.exportData();
        const csv = 'Category,Description,Quantity,Age\n' +
                data.map(row => `${row.category},${row.description},${row.quantity},${row.age}`).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'equipment-inventory.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }
};
