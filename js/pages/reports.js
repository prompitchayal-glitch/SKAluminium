// ===== Reports Page Controller =====
const ReportsPage = {
    dashboardData: null,
    currentReportType: 'revenue',

    // Initialize reports page
    async init() {
        await this.loadDashboardData();
        this.setupEventListeners();
    },

    // Load dashboard data
    async loadDashboardData() {
        try {
            const data = await api.reports.getDashboard();
            this.dashboardData = data;
            this.updateSummaryCards(data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    },

    // Update summary cards
    updateSummaryCards(data) {
        if (!data) return;

        const cards = document.querySelectorAll('.summary-card');
        if (cards.length >= 4) {
            // Revenue
            const revenueAmount = cards[0].querySelector('.amount');
            if (revenueAmount) revenueAmount.textContent = `฿${(data.totalRevenue || 0).toLocaleString('th-TH')}`;

            // Profit
            const profitAmount = cards[1].querySelector('.amount');
            if (profitAmount) profitAmount.textContent = `฿${(data.totalProfit || 0).toLocaleString('th-TH')}`;

            // Completed Projects
            const projectsAmount = cards[2].querySelector('.amount');
            if (projectsAmount) projectsAmount.textContent = data.completedProjects || 0;

            // Margin
            const marginAmount = cards[3].querySelector('.amount');
            if (marginAmount) marginAmount.textContent = `${(data.profitMargin || 0).toFixed(1)}%`;
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Report period selection
        document.getElementById('reportPeriod')?.addEventListener('change', async (e) => {
            await this.loadDashboardData();
        });

        // Export report button
        document.getElementById('exportReportBtn')?.addEventListener('click', () => {
            this.exportCurrentReport();
        });

        // Report tab buttons
        document.querySelectorAll('.reports-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // Update active tab
                document.querySelectorAll('.reports-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Load report data
                this.currentReportType = e.target.dataset.report;
                await this.loadReportData(this.currentReportType);
            });
        });
    },

    // Load specific report data
    async loadReportData(reportType) {
        try {
            let data;
            switch (reportType) {
                case 'revenue':
                    data = await api.reports.getSales();
                    this.renderRevenueReport(data);
                    break;
                case 'projects':
                    data = await api.reports.getProjects();
                    this.renderProjectsReport(data);
                    break;
                case 'inventory':
                    data = await api.reports.getInventory();
                    this.renderInventoryReport(data);
                    break;
                case 'attendance':
                    data = await api.reports.getAttendance();
                    this.renderAttendanceReport(data);
                    break;
            }
        } catch (error) {
            console.error('Error loading report data:', error);
        }
    },

    // Render revenue report
    renderRevenueReport(data) {
        const section = document.getElementById('revenueReport');
        if (!section) return;

        const records = data?.records || [];
        
        let html = `
            <div class="report-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>วันที่</th>
                            <th>โครงการ</th>
                            <th>ลูกค้า</th>
                            <th>รายได้</th>
                            <th>ต้นทุน</th>
                            <th>กำไร</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (records.length === 0) {
            html += `<tr><td colspan="6" style="text-align: center; padding: 40px;">ไม่มีข้อมูล</td></tr>`;
        } else {
            records.forEach(r => {
                html += `
                    <tr>
                        <td>${new Date(r.date).toLocaleDateString('th-TH')}</td>
                        <td>${r.projectName || '-'}</td>
                        <td>${r.customerName || '-'}</td>
                        <td>฿${(r.revenue || 0).toLocaleString('th-TH')}</td>
                        <td>฿${(r.cost || 0).toLocaleString('th-TH')}</td>
                        <td>฿${(r.profit || 0).toLocaleString('th-TH')}</td>
                    </tr>
                `;
            });
        }

        html += `</tbody></table></div>`;
        section.innerHTML = html;
    },

    // Render projects report
    renderProjectsReport(data) {
        const section = document.getElementById('projectsReport');
        if (!section) return;

        const records = data?.projects || [];
        
        let html = `
            <div class="report-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>โครงการ</th>
                            <th>ลูกค้า</th>
                            <th>สถานะ</th>
                            <th>วันเริ่ม</th>
                            <th>วันเสร็จ</th>
                            <th>ราคาขาย</th>
                            <th>การชำระ</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (records.length === 0) {
            html += `<tr><td colspan="7" style="text-align: center; padding: 40px;">ไม่มีข้อมูล</td></tr>`;
        } else {
            records.forEach(p => {
                const statusLabel = {
                    'planning': 'วางแผน',
                    'in-progress': 'กำลังดำเนินการ',
                    'completed': 'เสร็จสิ้น'
                }[p.status] || p.status;

                html += `
                    <tr>
                        <td>${p.name || '-'}</td>
                        <td>${p.customerName || '-'}</td>
                        <td>${statusLabel}</td>
                        <td>${p.startDate ? new Date(p.startDate).toLocaleDateString('th-TH') : '-'}</td>
                        <td>${p.endDate ? new Date(p.endDate).toLocaleDateString('th-TH') : '-'}</td>
                        <td>฿${(p.sellingPrice || 0).toLocaleString('th-TH')}</td>
                        <td>${p.paymentStatus === 'PAID' ? '✓ ชำระแล้ว' : '✗ ค้างชำระ'}</td>
                    </tr>
                `;
            });
        }

        html += `</tbody></table></div>`;
        section.innerHTML = html;
    },

    // Render inventory report
    renderInventoryReport(data) {
        const section = document.getElementById('inventoryReport');
        if (!section) return;

        const records = data?.items || [];
        
        let html = `
            <div class="report-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>วัสดุ</th>
                            <th>ประเภท</th>
                            <th>คงเหลือ</th>
                            <th>หน่วย</th>
                            <th>มูลค่า</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (records.length === 0) {
            html += `<tr><td colspan="6" style="text-align: center; padding: 40px;">ไม่มีข้อมูล</td></tr>`;
        } else {
            records.forEach(item => {
                const isLow = item.quantity <= item.minStock;
                const value = item.quantity * (item.pricePerUnit || 0);

                html += `
                    <tr>
                        <td>${item.name || '-'}</td>
                        <td>${item.category === 'NEW' ? 'วัสดุใหม่' : 'เศษวัสดุ'}</td>
                        <td>${item.quantity}</td>
                        <td>${item.unit}</td>
                        <td>฿${value.toLocaleString('th-TH')}</td>
                        <td><span class="${isLow ? 'status-low' : 'status-normal'}">${isLow ? 'ใกล้หมด' : 'ปกติ'}</span></td>
                    </tr>
                `;
            });
        }

        html += `</tbody></table></div>`;
        section.innerHTML = html;
    },

    // Render attendance report
    renderAttendanceReport(data) {
        const section = document.getElementById('attendanceReport');
        if (!section) return;

        const records = data?.records || [];
        
        let html = `
            <div class="report-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>พนักงาน</th>
                            <th>วันทำงาน</th>
                            <th>มาสาย</th>
                            <th>ขาด</th>
                            <th>ชั่วโมงรวม</th>
                            <th>เฉลี่ย/วัน</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (records.length === 0) {
            html += `<tr><td colspan="6" style="text-align: center; padding: 40px;">ไม่มีข้อมูล</td></tr>`;
        } else {
            records.forEach(r => {
                const avgHours = r.workDays > 0 ? (r.totalHours / r.workDays).toFixed(1) : 0;

                html += `
                    <tr>
                        <td>${r.userName || '-'}</td>
                        <td>${r.workDays || 0}</td>
                        <td>${r.lateDays || 0}</td>
                        <td>${r.absentDays || 0}</td>
                        <td>${r.totalHours || 0} ชม.</td>
                        <td>${avgHours} ชม.</td>
                    </tr>
                `;
            });
        }

        html += `</tbody></table></div>`;
        section.innerHTML = html;
    },

    // Export current report
    async exportCurrentReport() {
        try {
            let data;
            let exportData;
            let filename;

            switch (this.currentReportType) {
                case 'revenue':
                    data = await api.reports.getSales();
                    exportData = (data?.records || []).map(r => ({
                        'วันที่': new Date(r.date).toLocaleDateString('th-TH'),
                        'โครงการ': r.projectName || '-',
                        'ลูกค้า': r.customerName || '-',
                        'รายได้': r.revenue || 0,
                        'ต้นทุน': r.cost || 0,
                        'กำไร': r.profit || 0
                    }));
                    filename = 'revenue_report';
                    break;

                case 'projects':
                    data = await api.reports.getProjects();
                    exportData = (data?.projects || []).map(p => ({
                        'โครงการ': p.name || '-',
                        'ลูกค้า': p.customerName || '-',
                        'สถานะ': p.status || '-',
                        'วันเริ่ม': p.startDate ? new Date(p.startDate).toLocaleDateString('th-TH') : '-',
                        'วันเสร็จ': p.endDate ? new Date(p.endDate).toLocaleDateString('th-TH') : '-',
                        'ราคาขาย': p.sellingPrice || 0,
                        'การชำระ': p.paymentStatus === 'PAID' ? 'ชำระแล้ว' : 'ค้างชำระ'
                    }));
                    filename = 'projects_report';
                    break;

                case 'inventory':
                    data = await api.reports.getInventory();
                    exportData = (data?.items || []).map(item => ({
                        'วัสดุ': item.name || '-',
                        'ประเภท': item.category === 'NEW' ? 'วัสดุใหม่' : 'เศษวัสดุ',
                        'คงเหลือ': item.quantity,
                        'หน่วย': item.unit,
                        'ราคา/หน่วย': item.pricePerUnit || 0,
                        'มูลค่ารวม': item.quantity * (item.pricePerUnit || 0),
                        'สถานะ': item.quantity <= item.minStock ? 'ใกล้หมด' : 'ปกติ'
                    }));
                    filename = 'inventory_report';
                    break;

                case 'attendance':
                    data = await api.reports.getAttendance();
                    exportData = (data?.records || []).map(r => ({
                        'พนักงาน': r.userName || '-',
                        'วันทำงาน': r.workDays || 0,
                        'มาสาย': r.lateDays || 0,
                        'ขาด': r.absentDays || 0,
                        'ชั่วโมงรวม': r.totalHours || 0,
                        'เฉลี่ย/วัน': r.workDays > 0 ? (r.totalHours / r.workDays).toFixed(1) : 0
                    }));
                    filename = 'attendance_report';
                    break;
            }

            if (exportData && exportData.length > 0) {
                ExportUtils.exportToExcel(exportData, filename);
            } else {
                alert('ไม่มีข้อมูลสำหรับ Export');
            }
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('เกิดข้อผิดพลาดในการ Export: ' + error.message);
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('exportReportBtn')) {
        ReportsPage.init();
    }
});
