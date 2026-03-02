// ===== Projects Page Controller =====
const ProjectsPage = {
    projects: [],
    customers: [],
    currentProjectId: null,

    // Initialize projects page
    async init() {
        await Promise.all([
            this.loadProjects(),
            this.loadCustomers()
        ]);
        this.setupEventListeners();
    },

    // Load projects from API
    async loadProjects() {
        try {
            const projects = await api.projects.getAll();
            this.projects = projects;
            this.renderProjectsGrid(projects);
            this.updateStats();
        } catch (error) {
            console.error('Error loading projects:', error);
            this.projects = [];
        }
    },

    // Load customers for dropdown
    async loadCustomers() {
        try {
            const customers = await api.customers.getAll();
            this.customers = customers;
            this.populateCustomerDropdown();
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    },

    // Populate customer dropdown in form
    populateCustomerDropdown() {
        const select = document.getElementById('projectCustomer');
        if (!select) return;

        select.innerHTML = '<option value="">เลือกลูกค้า</option>' +
            this.customers.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
    },

    // Render projects grid
    renderProjectsGrid(projects) {
        const grid = document.querySelector('.projects-grid');
        if (!grid) return;

        if (projects.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;">
                    ยังไม่มีโครงการ คลิก "+ สร้างโครงการใหม่" เพื่อเริ่มต้น
                </div>
            `;
            return;
        }

        grid.innerHTML = projects.map(project => {
            const statusBadge = this.getStatusBadge(project.status);
            const paymentBadge = this.getPaymentBadge(project.paymentStatus);
            const customerName = project.customerId?.name || 'ไม่ระบุ';
            const teamNames = (project.assignedTeam || []).map(t => t.username || t).join(', ') || 'ไม่ระบุ';
            
            return `
                <div class="project-card" data-id="${project._id}">
                    <div class="project-header">
                        <h3>โครงการ #${project._id.slice(-6)}</h3>
                        ${statusBadge}
                    </div>
                    <div class="project-info">
                        <p><strong>ลูกค้า:</strong> ${customerName}</p>
                        <p><strong>ทีมงาน:</strong> ${teamNames}</p>
                        <p><strong>วันที่สร้าง:</strong> ${project.createdAt ? new Date(project.createdAt).toLocaleDateString('th-TH') : '-'}</p>
                    </div>
                    <div class="project-cost">
                        <div class="cost-item">
                            <span>ต้นทุน:</span>
                            <span>฿${(project.totalCost || 0).toLocaleString('th-TH')}</span>
                        </div>
                        <div class="cost-item">
                            <span>ราคาขาย:</span>
                            <span>฿${(project.totalPrice || 0).toLocaleString('th-TH')}</span>
                        </div>
                        <div class="cost-item profit">
                            <span>กำไร:</span>
                            <span>฿${((project.totalPrice || 0) - (project.totalCost || 0)).toLocaleString('th-TH')}</span>
                        </div>
                    </div>
                    <div class="project-payment">
                        ${paymentBadge}
                    </div>
                    <div class="project-actions">
                        <button class="btn-secondary view-btn" data-id="${project._id}">ดูรายละเอียด</button>
                        <button class="btn-primary edit-btn" data-id="${project._id}">แก้ไข</button>
                    </div>
                </div>
            `;
        }).join('');

        this.attachProjectEventListeners();
    },

    // Get status badge HTML
    getStatusBadge(status) {
        const badges = {
            'รอดำเนินการ': '<span class="badge badge-planning">รอดำเนินการ</span>',
            'กำลังดำเนินการ': '<span class="badge badge-warning">กำลังดำเนินการ</span>',
            'เสร็จสิ้น': '<span class="badge badge-success">เสร็จสิ้น</span>',
            'ยกเลิก': '<span class="badge badge-danger">ยกเลิก</span>'
        };
        return badges[status] || '<span class="badge">-</span>';
    },

    // Get payment status badge HTML
    getPaymentBadge(paymentStatus) {
        const badges = {
            'paid': '<span class="payment-status paid">✓ ชำระแล้ว</span>',
            'partial': '<span class="payment-status partial">⏳ ชำระบางส่วน</span>',
            'unpaid': '<span class="payment-status unpaid">✗ ยังไม่ชำระ</span>'
        };
        return badges[paymentStatus] || badges['unpaid'];
    },

    // Attach event listeners to project cards
    attachProjectEventListeners() {
        document.querySelectorAll('.project-card .edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.editProject(e.target.dataset.id);
            });
        });

        document.querySelectorAll('.project-card .view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.viewProject(e.target.dataset.id);
            });
        });
    },

    // Update stats cards
    updateStats() {
        const total = this.projects.length;
        const inProgress = this.projects.filter(p => p.status === 'กำลังดำเนินการ').length;
        const completed = this.projects.filter(p => p.status === 'เสร็จสิ้น').length;
        const totalRevenue = this.projects.reduce((sum, p) => sum + (p.totalPrice || 0), 0);

        const statCards = document.querySelectorAll('.stat-card .stat-info h3');
        if (statCards.length >= 4) {
            statCards[0].textContent = total;
            statCards[1].textContent = inProgress;
            statCards[2].textContent = completed;
            statCards[3].textContent = `฿${(totalRevenue / 1000).toFixed(0)}K`;
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Add Project Form
        const addProjectForm = document.getElementById('addProjectForm');
        if (addProjectForm) {
            addProjectForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveProject();
            });
        }

        // Search and Filter
        const searchInput = document.getElementById('searchProject');
        const filterPayment = document.getElementById('filterPaymentStatus');
        const filterStatus = document.getElementById('filterStatus');

        [searchInput, filterPayment, filterStatus].forEach(el => {
            el?.addEventListener('input', () => this.filterProjects());
            el?.addEventListener('change', () => this.filterProjects());
        });
    },

    // Save project (create or update)
    async saveProject() {
        const formData = {
            customerId: document.getElementById('projectCustomer')?.value || null,
            totalCost: parseFloat(document.getElementById('projectCost')?.value) || 0,
            totalPrice: parseFloat(document.getElementById('projectSellingPrice')?.value) || 0,
            status: document.getElementById('projectStatus')?.value || 'รอดำเนินการ',
            paymentStatus: document.getElementById('projectPaymentStatus')?.value || 'unpaid',
            description: document.getElementById('projectDescription')?.value
        };

        try {
            if (this.currentProjectId) {
                await api.projects.update(this.currentProjectId, formData);
                alert('แก้ไขโครงการเรียบร้อย');
            } else {
                await api.projects.create(formData);
                alert('สร้างโครงการเรียบร้อย');
            }
            
            closeModal('addProjectModal');
            document.getElementById('addProjectForm')?.reset();
            this.currentProjectId = null;
            await this.loadProjects();
        } catch (error) {
            console.error('Error saving project:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    },

    // Edit project
    editProject(id) {
        const project = this.projects.find(p => p._id === id);
        if (!project) return;

        this.currentProjectId = id;

        // Fill form with project data
        const fields = {
            'projectName': project.name,
            'projectCustomer': project.customer?._id || project.customer,
            'projectTeam': project.team,
            'projectStartDate': project.startDate?.split('T')[0],
            'projectEndDate': project.endDate?.split('T')[0],
            'projectCost': project.cost,
            'projectSellingPrice': project.sellingPrice,
            'projectStatus': project.status,
            'projectPaymentStatus': project.paymentStatus,
            'projectDescription': project.description
        };

        Object.entries(fields).forEach(([fieldId, value]) => {
            const el = document.getElementById(fieldId);
            if (el && value !== undefined) el.value = value;
        });

        openModal('addProjectModal');
    },

    // View project details
    viewProject(id) {
        const project = this.projects.find(p => p._id === id);
        if (!project) return;

        alert(`รายละเอียดโครงการ:\n\n${project.name}\nลูกค้า: ${project.customerName || '-'}\nสถานะ: ${project.status}\nราคา: ฿${project.sellingPrice?.toLocaleString('th-TH')}`);
    },

    // Filter projects
    filterProjects() {
        const search = document.getElementById('searchProject')?.value.toLowerCase() || '';
        const payment = document.getElementById('filterPaymentStatus')?.value || 'all';
        const status = document.getElementById('filterStatus')?.value || 'all';

        const filtered = this.projects.filter(project => {
            const matchSearch = project.name.toLowerCase().includes(search) ||
                               (project.customerName || '').toLowerCase().includes(search);
            const matchPayment = payment === 'all' || project.paymentStatus === payment;
            const matchStatus = status === 'all' || project.status === status;
            
            return matchSearch && matchPayment && matchStatus;
        });

        this.renderProjectsGrid(filtered);
    },

    // Export to Excel
    exportToExcel() {
        const data = this.projects.map(p => ({
            'ชื่อโครงการ': p.name,
            'ลูกค้า': p.customerName || '-',
            'ทีมงาน': p.team || '-',
            'วันเริ่ม': p.startDate ? new Date(p.startDate).toLocaleDateString('th-TH') : '-',
            'วันเสร็จ': p.endDate ? new Date(p.endDate).toLocaleDateString('th-TH') : '-',
            'ต้นทุน': p.cost || 0,
            'ราคาขาย': p.sellingPrice || 0,
            'กำไร': (p.sellingPrice || 0) - (p.cost || 0),
            'สถานะ': p.status,
            'การชำระเงิน': p.paymentStatus === 'PAID' ? 'ชำระแล้ว' : 'ค้างชำระ'
        }));

        ExportUtils.exportToExcel(data, 'projects');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('addProjectBtn')) {
        ProjectsPage.init();
    }
});
