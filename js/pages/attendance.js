// ===== Attendance Page Controller =====
const AttendancePage = {
    attendanceRecords: [],
    currentUser: null,
    todayRecord: null,

    // Initialize attendance page
    async init() {
        this.currentUser = JSON.parse(sessionStorage.getItem('user'));
        await this.loadTodayStatus();
        await this.loadAttendanceHistory();
        this.setupEventListeners();
        this.startClock();
    },

    // Start real-time clock
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const timeEl = document.getElementById('currentTime');
            if (timeEl) {
                timeEl.textContent = now.toLocaleTimeString('th-TH');
            }

            const dateEl = document.getElementById('currentDateDisplay');
            if (dateEl) {
                const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
                dateEl.textContent = `วัน${days[now.getDay()]}ที่ ${now.toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}`;
            }
        };

        updateClock();
        setInterval(updateClock, 1000);
    },

    // Load today's status
    async loadTodayStatus() {
        if (!this.currentUser?.id) return;

        try {
            const result = await api.attendance.getToday(this.currentUser.id);
            this.todayRecord = result;
            this.updateTodayDisplay();
        } catch (error) {
            console.error('Error loading today status:', error);
            this.todayRecord = null;
            this.updateTodayDisplay();
        }
    },

    // Update today's status display
    updateTodayDisplay() {
        const checkInEl = document.getElementById('todayCheckIn');
        const statusEl = document.querySelector('.status-working');
        const checkInBtn = document.getElementById('checkInBtn');
        const checkOutBtn = document.getElementById('checkOutBtn');

        if (this.todayRecord) {
            if (this.todayRecord.checkIn) {
                const checkInTime = new Date(this.todayRecord.checkIn).toLocaleTimeString('th-TH');
                if (checkInEl) checkInEl.textContent = checkInTime;
                
                if (this.todayRecord.checkOut) {
                    if (statusEl) {
                        statusEl.textContent = 'เลิกงานแล้ว';
                        statusEl.className = 'status-done';
                    }
                    if (checkInBtn) checkInBtn.disabled = true;
                    if (checkOutBtn) checkOutBtn.disabled = true;
                } else {
                    if (statusEl) {
                        statusEl.textContent = 'กำลังทำงาน';
                        statusEl.className = 'status-working';
                    }
                    if (checkInBtn) checkInBtn.disabled = true;
                    if (checkOutBtn) checkOutBtn.disabled = false;
                }
            }
        } else {
            if (checkInEl) checkInEl.textContent = '-';
            if (statusEl) {
                statusEl.textContent = 'ยังไม่เข้างาน';
                statusEl.className = 'status-absent';
            }
            if (checkInBtn) checkInBtn.disabled = false;
            if (checkOutBtn) checkOutBtn.disabled = true;
        }
    },

    // Load attendance history
    async loadAttendanceHistory() {
        try {
            const month = document.getElementById('filterMonth')?.value || 
                new Date().toISOString().slice(0, 7);
            const userId = document.getElementById('filterEmployee')?.value || 'all';

            const params = { month };
            if (userId !== 'all') params.userId = userId;

            const records = await api.attendance.getAll(params);
            this.attendanceRecords = records;
            this.updateStats();
            this.renderAttendanceTable(records);
        } catch (error) {
            console.error('Error loading attendance history:', error);
        }
    },

    // Update stats cards
    updateStats() {
        const records = this.attendanceRecords;
        const presentDays = records.filter(r => r.checkIn).length;
        const lateDays = records.filter(r => {
            if (!r.checkIn) return false;
            const checkInTime = new Date(r.checkIn);
            return checkInTime.getHours() >= 9; // After 9 AM = late
        }).length;
        const absentDays = records.filter(r => !r.checkIn && r.status === 'absent').length;
        
        // Calculate total work hours
        let totalHours = 0;
        records.forEach(r => {
            if (r.checkIn && r.checkOut) {
                const ms = new Date(r.checkOut) - new Date(r.checkIn);
                totalHours += ms / (1000 * 60 * 60);
            }
        });

        const statCards = document.querySelectorAll('.stat-card .stat-info h3');
        if (statCards.length >= 4) {
            statCards[0].textContent = presentDays;
            statCards[1].textContent = lateDays;
            statCards[2].textContent = absentDays;
            statCards[3].textContent = Math.round(totalHours);
        }
    },

    // Render attendance table
    renderAttendanceTable(records) {
        const tbody = document.getElementById('attendanceList');
        if (!tbody) return;

        if (records.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                        ไม่มีข้อมูลการเข้างานในเดือนนี้
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = records.map(record => {
            const date = new Date(record.date).toLocaleDateString('th-TH');
            const checkIn = record.checkIn ? new Date(record.checkIn).toLocaleTimeString('th-TH') : '-';
            const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleTimeString('th-TH') : '-';
            
            let hours = '-';
            if (record.checkIn && record.checkOut) {
                const ms = new Date(record.checkOut) - new Date(record.checkIn);
                hours = (ms / (1000 * 60 * 60)).toFixed(1) + ' ชม.';
            }

            const statusClass = record.checkIn ? 
                (new Date(record.checkIn).getHours() >= 9 ? 'status-late' : 'status-present') : 
                'status-absent';
            const statusText = record.checkIn ? 
                (new Date(record.checkIn).getHours() >= 9 ? 'มาสาย' : 'ปกติ') : 
                'ขาด';

            return `
                <tr>
                    <td>${date}</td>
                    <td>${record.userName || '-'}</td>
                    <td>${checkIn}</td>
                    <td>${checkOut}</td>
                    <td>${hours}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                </tr>
            `;
        }).join('');
    },

    // Setup event listeners
    setupEventListeners() {
        // Check In button
        document.getElementById('checkInBtn')?.addEventListener('click', () => {
            this.showAttendanceModal('in');
        });

        // Check Out button
        document.getElementById('checkOutBtn')?.addEventListener('click', () => {
            this.showAttendanceModal('out');
        });

        // Confirm attendance
        document.getElementById('confirmAttendance')?.addEventListener('click', async () => {
            await this.confirmAttendance();
        });

        // Cancel attendance
        document.getElementById('cancelAttendance')?.addEventListener('click', () => {
            closeModal('attendanceModal');
        });

        // Filter change
        document.getElementById('filterMonth')?.addEventListener('change', () => {
            this.loadAttendanceHistory();
        });

        document.getElementById('filterEmployee')?.addEventListener('change', () => {
            this.loadAttendanceHistory();
        });

        // Export button
        document.getElementById('exportAttendanceBtn')?.addEventListener('click', () => {
            this.exportToExcel();
        });
    },

    // Show attendance modal
    showAttendanceModal(action) {
        this.currentAction = action;
        
        const title = action === 'in' ? 'ยืนยันการเข้างาน' : 'ยืนยันการออกงาน';
        const message = action === 'in' ? 
            'คุณต้องการบันทึกเวลาเข้างานใช่หรือไม่?' : 
            'คุณต้องการบันทึกเวลาออกงานใช่หรือไม่?';

        document.getElementById('attendanceModalTitle').textContent = title;
        document.getElementById('attendanceModalMessage').textContent = message;

        const now = new Date();
        document.getElementById('confirmTime').textContent = now.toLocaleTimeString('th-TH');
        document.getElementById('confirmDate').textContent = now.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        openModal('attendanceModal');
    },

    // Confirm attendance
    async confirmAttendance() {
        const note = document.getElementById('attendanceNote')?.value || '';

        try {
            if (this.currentAction === 'in') {
                await api.attendance.checkIn(
                    this.currentUser.id, 
                    this.currentUser.name || this.currentUser.email,
                    note
                );
                alert('บันทึกเวลาเข้างานเรียบร้อย');
            } else {
                await api.attendance.checkOut(this.currentUser.id, note);
                alert('บันทึกเวลาออกงานเรียบร้อย');
            }

            closeModal('attendanceModal');
            document.getElementById('attendanceNote').value = '';
            await this.loadTodayStatus();
            await this.loadAttendanceHistory();
        } catch (error) {
            console.error('Error recording attendance:', error);
            alert('เกิดข้อผิดพลาด: ' + error.message);
        }
    },

    // Export to Excel
    exportToExcel() {
        const data = this.attendanceRecords.map(r => {
            const checkIn = r.checkIn ? new Date(r.checkIn).toLocaleTimeString('th-TH') : '-';
            const checkOut = r.checkOut ? new Date(r.checkOut).toLocaleTimeString('th-TH') : '-';
            
            let hours = 0;
            if (r.checkIn && r.checkOut) {
                const ms = new Date(r.checkOut) - new Date(r.checkIn);
                hours = (ms / (1000 * 60 * 60)).toFixed(1);
            }

            return {
                'วันที่': new Date(r.date).toLocaleDateString('th-TH'),
                'ชื่อพนักงาน': r.userName || '-',
                'เวลาเข้า': checkIn,
                'เวลาออก': checkOut,
                'ชั่วโมงทำงาน': hours,
                'สถานะ': r.checkIn ? (new Date(r.checkIn).getHours() >= 9 ? 'มาสาย' : 'ปกติ') : 'ขาด',
                'หมายเหตุ': r.note || '-'
            };
        });

        ExportUtils.exportToExcel(data, 'attendance');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('checkInBtn')) {
        AttendancePage.init();
    }
});
