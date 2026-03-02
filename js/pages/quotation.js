// ===== Quotation Page Controller =====
const QuotationPage = {
    quotations: [],
    currentQuotation: null,
    customers: [],
    inventoryItems: [],
    quotationItems: [],

    // Initialize quotation page
    async init() {
        await Promise.all([
            this.loadCustomers(),
            this.loadInventory()
        ]);
        this.setupEventListeners();
        this.initNewQuotation();
    },

    // Load customers for selection
    async loadCustomers() {
        try {
            this.customers = await api.customers.getAll();
            this.populateCustomerSelect();
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    },

    // Load inventory items for item selection
    async loadInventory() {
        try {
            this.inventoryItems = await api.inventory.getAll();
            this.populateItemSelect();
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    },

    // Populate customer select
    populateCustomerSelect() {
        const select = document.getElementById('selectCustomer');
        if (!select) return;

        select.innerHTML = '<option value="">เลือกลูกค้า</option>' +
            this.customers.map(c => `
                <option value="${c._id}" 
                    data-name="${c.name}" 
                    data-address="${c.address || ''}" 
                    data-phone="${c.phone || ''}">
                    ${c.name}
                </option>
            `).join('');
    },

    // Populate item select in modal
    populateItemSelect() {
        const select = document.getElementById('selectMaterial');
        if (!select) return;

        select.innerHTML = '<option value="">เลือกวัสดุ</option>' +
            this.inventoryItems.map(item => `
                <option value="${item._id}" 
                    data-name="${item.name}" 
                    data-unit="${item.unit}" 
                    data-price="${item.pricePerUnit}">
                    ${item.name} (฿${item.pricePerUnit?.toLocaleString('th-TH')}/${item.unit})
                </option>
            `).join('');
    },

    // Initialize new quotation
    async initNewQuotation() {
        this.quotationItems = [];
        
        // Get next quotation number
        try {
            const result = await api.quotations.getNextNumber();
            document.getElementById('quotationNumber').textContent = result.number || 'QT-001';
        } catch (error) {
            document.getElementById('quotationNumber').textContent = 'QT-001';
        }

        // Set current date
        const today = new Date();
        document.getElementById('quotationDate').textContent = today.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        this.renderQuotationItems();
    },

    // Setup event listeners
    setupEventListeners() {
        // Customer selection
        const selectCustomer = document.getElementById('selectCustomer');
        selectCustomer?.addEventListener('change', (e) => {
            const option = e.target.selectedOptions[0];
            if (option && option.value) {
                document.getElementById('customerName').textContent = option.dataset.name || '';
                document.getElementById('customerAddress').textContent = option.dataset.address || '';
                document.getElementById('customerPhone').textContent = option.dataset.phone || '';
            }
        });

        // Add item form
        const addItemForm = document.getElementById('addItemForm');
        if (addItemForm) {
            addItemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addItemToQuotation();
            });
        }

        // Material selection auto-fill
        const selectMaterial = document.getElementById('selectMaterial');
        selectMaterial?.addEventListener('change', (e) => {
            const option = e.target.selectedOptions[0];
            if (option && option.value) {
                document.getElementById('itemName').value = option.dataset.name || '';
                document.getElementById('itemUnit').value = option.dataset.unit || '';
                document.getElementById('itemPrice').value = option.dataset.price || '';
            }
        });

        // Create new quotation button
        document.getElementById('createQuotationBtn')?.addEventListener('click', () => {
            if (confirm('สร้างใบเสนอราคาใหม่? ข้อมูลปัจจุบันจะถูกล้าง')) {
                this.initNewQuotation();
                document.getElementById('customerName').textContent = '';
                document.getElementById('customerAddress').textContent = '';
                document.getElementById('customerPhone').textContent = '';
                document.getElementById('selectCustomer').value = '';
            }
        });

        // Save quotation
        document.getElementById('saveQuotationBtn')?.addEventListener('click', () => {
            this.saveQuotation();
        });

        // Print quotation
        document.getElementById('printQuotationBtn')?.addEventListener('click', () => {
            this.printQuotation();
        });

        // Export PDF
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => {
            this.exportToPDF();
        });
    },

    // Add item to quotation
    addItemToQuotation() {
        const name = document.getElementById('itemName').value;
        const quantity = parseFloat(document.getElementById('itemQuantity').value) || 0;
        const unit = document.getElementById('itemUnit').value;
        const unitPrice = parseFloat(document.getElementById('itemPrice').value) || 0;

        if (!name || !quantity || !unit || !unitPrice) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        this.quotationItems.push({
            name,
            quantity,
            unit,
            unitPrice,
            total: quantity * unitPrice
        });

        this.renderQuotationItems();
        closeModal('addItemModal');
        document.getElementById('addItemForm').reset();
    },

    // Render quotation items table
    renderQuotationItems() {
        const tbody = document.getElementById('quotationItems');
        if (!tbody) return;

        let html = this.quotationItems.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${item.unitPrice.toLocaleString('th-TH')}</td>
                <td>${item.total.toLocaleString('th-TH')}</td>
                <td>
                    <button class="btn-icon remove-item-btn" data-index="${index}" title="ลบ">🗑️</button>
                </td>
            </tr>
        `).join('');

        // Add item row
        html += `
            <tr class="add-item-row">
                <td colspan="7">
                    <button type="button" class="btn-add-item" id="addItemBtn">+ เพิ่มรายการ</button>
                </td>
            </tr>
        `;

        tbody.innerHTML = html;

        // Update total
        this.updateQuotationTotal();

        // Attach event listeners
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeItem(index);
            });
        });

        document.getElementById('addItemBtn')?.addEventListener('click', () => {
            openModal('addItemModal');
        });
    },

    // Remove item from quotation
    removeItem(index) {
        this.quotationItems.splice(index, 1);
        this.renderQuotationItems();
    },

    // Update quotation total
    updateQuotationTotal() {
        const total = this.quotationItems.reduce((sum, item) => sum + item.total, 0);
        document.getElementById('totalAmount').textContent = total.toLocaleString('th-TH');

        // Update summary
        const subtotal = total;
        const vat = total * 0.07;
        const grandTotal = total + vat;

        const summaryEl = document.getElementById('quotationSummary');
        if (summaryEl) {
            summaryEl.innerHTML = `
                <div class="summary-row">
                    <span>รวมเป็นเงิน:</span>
                    <span>฿${subtotal.toLocaleString('th-TH')}</span>
                </div>
                <div class="summary-row">
                    <span>ภาษีมูลค่าเพิ่ม 7%:</span>
                    <span>฿${vat.toLocaleString('th-TH', { maximumFractionDigits: 2 })}</span>
                </div>
                <div class="summary-row total">
                    <span>รวมทั้งสิ้น:</span>
                    <span>฿${grandTotal.toLocaleString('th-TH', { maximumFractionDigits: 2 })}</span>
                </div>
            `;
        }
    },

    // Save quotation
    async saveQuotation() {
        if (this.quotationItems.length === 0) {
            alert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
            return;
        }

        const customerName = document.getElementById('customerName')?.textContent;
        if (!customerName) {
            alert('กรุณาเลือกลูกค้า');
            return;
        }

        const quotationData = {
            quotationNumber: document.getElementById('quotationNumber')?.textContent,
            customer: document.getElementById('selectCustomer')?.value || null,
            customerName: customerName,
            customerAddress: document.getElementById('customerAddress')?.textContent,
            customerPhone: document.getElementById('customerPhone')?.textContent,
            items: this.quotationItems,
            subtotal: this.quotationItems.reduce((sum, item) => sum + item.total, 0),
            vat: this.quotationItems.reduce((sum, item) => sum + item.total, 0) * 0.07,
            total: this.quotationItems.reduce((sum, item) => sum + item.total, 0) * 1.07,
            status: 'draft',
            createdBy: JSON.parse(sessionStorage.getItem('user'))?.id
        };

        try {
            await api.quotations.create(quotationData);
            alert('บันทึกใบเสนอราคาเรียบร้อย');
        } catch (error) {
            console.error('Error saving quotation:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    },

    // Print quotation
    printQuotation() {
        window.print();
    },

    // Export to PDF
    exportToPDF() {
        const quotationData = {
            quotationNumber: document.getElementById('quotationNumber')?.textContent || 'QT-001',
            customerName: document.getElementById('customerName')?.textContent || '',
            customerAddress: document.getElementById('customerAddress')?.textContent || '',
            customerPhone: document.getElementById('customerPhone')?.textContent || '',
            date: document.getElementById('quotationDate')?.textContent || new Date().toLocaleDateString('th-TH'),
            validUntil: this.getValidUntilDate(),
            items: this.quotationItems
        };

        if (this.quotationItems.length === 0) {
            alert('กรุณาเพิ่มรายการสินค้าก่อน Export PDF');
            return;
        }

        ExportUtils.exportQuotationToPDF(quotationData);
    },

    // Get valid until date (30 days from now)
    getValidUntilDate() {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('createQuotationBtn')) {
        QuotationPage.init();
    }
});
