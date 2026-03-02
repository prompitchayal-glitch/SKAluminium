// ===== Export Utilities =====
// Using SheetJS (xlsx) for Excel and html2pdf.js for PDF

const ExportUtils = {
    // Export table data to Excel
    exportToExcel: function(data, filename = 'export') {
        if (!data || data.length === 0) {
            alert('ไม่มีข้อมูลสำหรับ Export');
            return;
        }

        // Create worksheet
        let csvContent = '\uFEFF'; // UTF-8 BOM for Thai support
        
        // Get headers from first row keys
        const headers = Object.keys(data[0]);
        csvContent += headers.join(',') + '\n';
        
        // Add data rows
        data.forEach(row => {
            const values = headers.map(h => {
                let val = row[h] || '';
                // Escape commas and quotes
                if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                    val = '"' + val.replace(/"/g, '""') + '"';
                }
                return val;
            });
            csvContent += values.join(',') + '\n';
        });
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Export element to PDF
    exportToPDF: function(elementId, filename = 'export') {
        const element = document.getElementById(elementId);
        if (!element) {
            alert('ไม่พบข้อมูลสำหรับ Export');
            return;
        }

        // Create print-friendly version
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${filename}</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { 
                        font-family: 'Sarabun', sans-serif; 
                        line-height: 1.6;
                        color: #333;
                    }
                    .quotation-paper {
                        max-width: 800px;
                        margin: auto;
                        padding: 20px;
                    }
                    .quotation-header {
                        display: flex;
                        justify-content: space-between;
                        border-bottom: 2px solid #1a365d;
                        padding-bottom: 20px;
                        margin-bottom: 20px;
                    }
                    .company-info h2 { 
                        color: #1a365d; 
                        margin: 0 0 10px 0;
                        font-size: 24px;
                    }
                    .company-info p {
                        margin: 5px 0;
                        color: #666;
                    }
                    .quotation-title h1 { 
                        color: #1a365d; 
                        margin: 0;
                        font-size: 28px;
                    }
                    .quotation-title p {
                        margin: 5px 0;
                        color: #666;
                        text-align: right;
                    }
                    .customer-section {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        padding: 15px;
                        background: #f7fafc;
                        border-radius: 5px;
                    }
                    .customer-info h3 {
                        margin: 0 0 10px 0;
                        color: #1a365d;
                    }
                    .customer-info p {
                        margin: 5px 0;
                    }
                    .quotation-info {
                        text-align: right;
                    }
                    .quotation-info p {
                        margin: 5px 0;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 20px 0;
                    }
                    th { 
                        background: #1a365d; 
                        color: white; 
                        padding: 12px; 
                        text-align: left;
                        font-weight: 600;
                    }
                    td { 
                        padding: 10px 12px; 
                        border-bottom: 1px solid #e2e8f0; 
                    }
                    tr:nth-child(even) {
                        background: #f7fafc;
                    }
                    .quotation-summary {
                        margin-top: 20px;
                        text-align: right;
                    }
                    .summary-row {
                        display: flex;
                        justify-content: flex-end;
                        padding: 8px 0;
                    }
                    .summary-row span:first-child {
                        margin-right: 50px;
                    }
                    .summary-row.total {
                        font-size: 18px;
                        font-weight: bold;
                        color: #1a365d;
                        border-top: 2px solid #1a365d;
                        padding-top: 15px;
                    }
                    .add-item-row { display: none !important; }
                    .btn-icon, .btn-primary, .btn-secondary { display: none !important; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    },

    // Export quotation to PDF with better formatting
    exportQuotationToPDF: function(quotationData) {
        const printWindow = window.open('', '_blank');
        const items = quotationData.items || [];
        const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        
        let itemsHTML = items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${item.unitPrice.toLocaleString('th-TH')}</td>
                <td>${(item.quantity * item.unitPrice).toLocaleString('th-TH')}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>ใบเสนอราคา - ${quotationData.quotationNumber}</title>
                <style>
                    @page { size: A4; margin: 15mm; }
                    body { 
                        font-family: 'Sarabun', 'Segoe UI', sans-serif; 
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        border-bottom: 3px solid #1a365d;
                        padding-bottom: 20px;
                        margin-bottom: 25px;
                    }
                    .company-info h1 { 
                        color: #1a365d; 
                        margin: 0;
                        font-size: 28px;
                    }
                    .company-info p { margin: 5px 0; color: #666; }
                    .doc-title { text-align: right; }
                    .doc-title h2 { 
                        color: #1a365d; 
                        margin: 0;
                        font-size: 26px;
                    }
                    .doc-title p { margin: 5px 0; }
                    .customer-box {
                        display: flex;
                        justify-content: space-between;
                        background: #f7fafc;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 25px;
                    }
                    .customer-box h3 { margin: 0 0 10px 0; color: #1a365d; }
                    .customer-box p { margin: 5px 0; }
                    .doc-info { text-align: right; }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 25px 0;
                    }
                    th { 
                        background: #1a365d; 
                        color: white; 
                        padding: 14px; 
                        text-align: center;
                    }
                    th:nth-child(2) { text-align: left; }
                    td { 
                        padding: 12px 14px; 
                        border-bottom: 1px solid #e2e8f0;
                        text-align: center;
                    }
                    td:nth-child(2) { text-align: left; }
                    td:nth-child(5), td:nth-child(6) { text-align: right; }
                    tr:nth-child(even) { background: #f7fafc; }
                    .summary {
                        margin-top: 30px;
                        text-align: right;
                    }
                    .summary-row {
                        display: flex;
                        justify-content: flex-end;
                        padding: 8px 0;
                        font-size: 14px;
                    }
                    .summary-row span:first-child { 
                        margin-right: 100px;
                        color: #666;
                    }
                    .summary-row.total {
                        font-size: 20px;
                        font-weight: bold;
                        color: #1a365d;
                        border-top: 2px solid #1a365d;
                        padding-top: 15px;
                        margin-top: 10px;
                    }
                    .footer {
                        margin-top: 60px;
                        display: flex;
                        justify-content: space-between;
                    }
                    .signature-box {
                        width: 200px;
                        text-align: center;
                    }
                    .signature-line {
                        border-top: 1px solid #333;
                        margin-top: 60px;
                        padding-top: 10px;
                    }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-info">
                        <h1>บริษัท SK Aluminium</h1>
                        <p>ที่อยู่: KU SRC University</p>
                        <p>หมายเลขผู้เสียภาษี: 1234567890</p>
                        <p>โทร: +123-456-7890</p>
                    </div>
                    <div class="doc-title">
                        <h2>ใบเสนอราคา</h2>
                        <p>Quotation</p>
                    </div>
                </div>
                
                <div class="customer-box">
                    <div class="customer-info">
                        <h3>ลูกค้า: ${quotationData.customerName || '-'}</h3>
                        <p>ที่อยู่: ${quotationData.customerAddress || '-'}</p>
                        <p>เบอร์โทร: ${quotationData.customerPhone || '-'}</p>
                    </div>
                    <div class="doc-info">
                        <p><strong>เลขที่:</strong> ${quotationData.quotationNumber || '-'}</p>
                        <p><strong>วันที่:</strong> ${quotationData.date || new Date().toLocaleDateString('th-TH')}</p>
                        <p><strong>มีผลถึง:</strong> ${quotationData.validUntil || '-'}</p>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th style="width: 50px;">ลำดับ</th>
                            <th>รายการ</th>
                            <th style="width: 80px;">จำนวน</th>
                            <th style="width: 80px;">หน่วย</th>
                            <th style="width: 100px;">ราคา/หน่วย</th>
                            <th style="width: 120px;">รวม</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>
                
                <div class="summary">
                    <div class="summary-row">
                        <span>รวมเป็นเงิน:</span>
                        <span>฿${total.toLocaleString('th-TH')}</span>
                    </div>
                    <div class="summary-row">
                        <span>ภาษีมูลค่าเพิ่ม 7%:</span>
                        <span>฿${(total * 0.07).toLocaleString('th-TH')}</span>
                    </div>
                    <div class="summary-row total">
                        <span>รวมทั้งสิ้น:</span>
                        <span>฿${(total * 1.07).toLocaleString('th-TH')}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="signature-box">
                        <div class="signature-line">ผู้เสนอราคา</div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-line">ผู้อนุมัติ</div>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
    },

    // Format date for display
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Format currency
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0
        }).format(amount);
    }
};

// Make available globally
window.ExportUtils = ExportUtils;
