// =============================================
// SK ALUMINIUM - MongoDB Seed Scripts
// รันใน MongoDB Compass Shell (mongosh)
// =============================================

// เลือก Database
use("sk_aluminium");

// =============================================
// 1. USERS Collection
// =============================================
db.users.deleteMany({});
db.users.insertMany([
    {
        name: "สมชาย เจริญธุรกิจ",
        email: "ceo@sk.com",
        password: "123456",
        role: "CEO",
        createdAt: new Date()
    },
    {
        name: "natthapong",
        email: "natthapong.cha@ku.th",
        password: "123456",
        role: "CEO",
        createdAt: new Date()
    },
    {
        name: "มานี รักษ์งาน",
        email: "manee@sk.com",
        password: "123456",
        role: "EMPLOYEE",
        createdAt: new Date()
    },
    {
        name: "วิชัย ใจซื่อ",
        email: "wichai@sk.com",
        password: "123456",
        role: "EMPLOYEE",
        createdAt: new Date()
    },
    {
        name: "สมหญิง ดีใจ",
        email: "somying@sk.com",
        password: "123456",
        role: "EMPLOYEE",
        createdAt: new Date()
    }
]);
print("✅ Users inserted: " + db.users.countDocuments() + " records");

// =============================================
// 2. CUSTOMERS Collection
// =============================================
db.customers.deleteMany({});
db.customers.insertMany([
    {
        name: "คุณธงชัย วงศ์สุวรรณ",
        phone: "081-234-5678",
        address: "55 หมู่บ้านแสนสิริ ถ.พุทธมณฑลสาย 2 บางแค กรุงเทพฯ 10160",
        createdAt: new Date()
    },
    {
        name: "คุณเมย์ลดา ศรีสุข",
        phone: "089-876-5432",
        address: "1502 คอนโด Regent Home บางนา กรุงเทพฯ 10260",
        createdAt: new Date()
    },
    {
        name: "คุณวิชัย ธนาพรชัย",
        phone: "086-111-2222",
        address: "123 ตลาดหนองแขม เขตหนองแขม กรุงเทพฯ 10160",
        createdAt: new Date()
    },
    {
        name: "บริษัท เดอะคอฟฟี่เฮาส์ จำกัด",
        phone: "02-123-4567",
        address: "999 อาคารเอ็มไพร์ทาวเวอร์ ชั้น 25 สาทร กรุงเทพฯ 10120",
        createdAt: new Date()
    },
    {
        name: "คุณสมศักดิ์ รักษาสุข",
        phone: "084-555-6666",
        address: "45/12 ซอยประชาอุทิศ 33 ทุ่งครุ กรุงเทพฯ 10140",
        createdAt: new Date()
    },
    {
        name: "บริษัท โมเดิร์นโฮม จำกัด",
        phone: "02-987-6543",
        address: "88 ถนนรัชดาภิเษก ห้วยขวาง กรุงเทพฯ 10310",
        createdAt: new Date()
    }
]);
print("✅ Customers inserted: " + db.customers.countDocuments() + " records");

// =============================================
// 3. MATERIALS Collection
// =============================================
db.materials.deleteMany({});
db.materials.insertMany([
    // Aluminum - NEW
    { name: "อลูมิเนียมเส้น สีขาว 1.5 นิ้ว", type: "NEW", quantity: 120, minimumThreshold: 20, unitPrice: 450 },
    { name: "อลูมิเนียมเส้น สีดำ 1.5 นิ้ว", type: "NEW", quantity: 85, minimumThreshold: 15, unitPrice: 480 },
    { name: "อลูมิเนียมเส้น สีชา 2 นิ้ว", type: "NEW", quantity: 45, minimumThreshold: 10, unitPrice: 520 },
    { name: "รางบานเลื่อนอลูมิเนียม", type: "NEW", quantity: 60, minimumThreshold: 10, unitPrice: 380 },
    
    // Glass - NEW
    { name: "กระจกใส 5 มม.", type: "NEW", quantity: 50, minimumThreshold: 10, unitPrice: 1200 },
    { name: "กระจกใส 6 มม.", type: "NEW", quantity: 35, minimumThreshold: 8, unitPrice: 1500 },
    { name: "กระจกสีชา 5 มม.", type: "NEW", quantity: 28, minimumThreshold: 5, unitPrice: 1400 },
    { name: "กระจกเงา 4 มม.", type: "NEW", quantity: 20, minimumThreshold: 5, unitPrice: 1800 },
    
    // Accessories - NEW
    { name: "ยางขอบกระจก EPDM", type: "NEW", quantity: 500, minimumThreshold: 100, unitPrice: 15 },
    { name: "ซิลิโคนใส", type: "NEW", quantity: 80, minimumThreshold: 20, unitPrice: 120 },
    { name: "ซิลิโคนสีดำ", type: "NEW", quantity: 60, minimumThreshold: 15, unitPrice: 130 },
    { name: "มุ้งลวดไฟเบอร์กลาส", type: "NEW", quantity: 30, minimumThreshold: 5, unitPrice: 850 },
    
    // Hardware - NEW
    { name: "มือจับประตูอลูมิเนียม สีเงิน", type: "NEW", quantity: 50, minimumThreshold: 10, unitPrice: 250 },
    { name: "มือจับประตูอลูมิเนียม สีดำ", type: "NEW", quantity: 35, minimumThreshold: 10, unitPrice: 280 },
    { name: "บานพับประตู 4 นิ้ว", type: "NEW", quantity: 100, minimumThreshold: 20, unitPrice: 85 },
    { name: "กลอนประตูสแตนเลส", type: "NEW", quantity: 40, minimumThreshold: 10, unitPrice: 180 },
    { name: "ล้อบานเลื่อน 25 มม.", type: "NEW", quantity: 200, minimumThreshold: 50, unitPrice: 35 },
    { name: "สกรูหัวจมดำ 1 นิ้ว", type: "NEW", quantity: 5000, minimumThreshold: 1000, unitPrice: 0.5 },
    
    // SCRAP Materials
    { name: "เศษอลูมิเนียม (รวม)", type: "SCRAP", quantity: 150, minimumThreshold: 0, unitPrice: 45 },
    { name: "เศษกระจก", type: "SCRAP", quantity: 80, minimumThreshold: 0, unitPrice: 5 }
]);
print("✅ Materials inserted: " + db.materials.countDocuments() + " records");

// =============================================
// 4. PROJECTS Collection
// =============================================
// ดึง Customer IDs มาใช้อ้างอิง
const customers = db.customers.find().toArray();
const users = db.users.find({ role: "EMPLOYEE" }).toArray();

db.projects.deleteMany({});
db.projects.insertMany([
    {
        customerId: customers[0]._id,
        customerName: customers[0].name,
        projectName: "บ้านเดี่ยว หมู่บ้านแสนสิริ - บ้านเลขที่ 55",
        totalCost: 95000,
        totalPrice: 185000,
        paymentStatus: "partial",
        assignedTeam: [users[0]._id, users[1]._id],
        status: "กำลังดำเนินการ",
        createdAt: new Date("2026-02-01")
    },
    {
        customerId: customers[1]._id,
        customerName: customers[1].name,
        projectName: "คอนโด Regent Home - ห้อง 1502",
        totalCost: 22000,
        totalPrice: 45000,
        paymentStatus: "unpaid",
        assignedTeam: [users[0]._id],
        status: "รอดำเนินการ",
        createdAt: new Date("2026-02-10")
    },
    {
        customerId: customers[2]._id,
        customerName: customers[2].name,
        projectName: "อาคารพาณิชย์ ตลาดหนองแขม",
        totalCost: 180000,
        totalPrice: 320000,
        paymentStatus: "paid",
        assignedTeam: [users[0]._id, users[1]._id, users[2]._id],
        status: "เสร็จสิ้น",
        createdAt: new Date("2026-01-05")
    },
    {
        customerId: customers[3]._id,
        customerName: customers[3].name,
        projectName: "ร้านกาแฟ The Coffee House สาขาบางแค",
        totalCost: 48000,
        totalPrice: 95000,
        paymentStatus: "partial",
        assignedTeam: [users[1]._id, users[2]._id],
        status: "กำลังดำเนินการ",
        createdAt: new Date("2026-02-10")
    },
    {
        customerId: customers[4]._id,
        customerName: customers[4].name,
        projectName: "บ้านคุณสมศักดิ์ ซอยประชาอุทิศ",
        totalCost: 38000,
        totalPrice: 78000,
        paymentStatus: "unpaid",
        assignedTeam: [users[0]._id],
        status: "รอดำเนินการ",
        createdAt: new Date("2026-02-12")
    }
]);
print("✅ Projects inserted: " + db.projects.countDocuments() + " records");

// =============================================
// 5. ATTENDANCE Collection
// =============================================
db.attendances.deleteMany({});

// สร้างข้อมูลการเข้างานย้อนหลัง 5 วัน
const attendanceData = [];
const workingDays = [
    new Date("2026-02-10"),
    new Date("2026-02-11"),
    new Date("2026-02-12"),
    new Date("2026-02-13"),
    new Date("2026-02-14")
];

users.forEach(user => {
    workingDays.forEach((day, index) => {
        // สุ่มเวลาเข้างาน (7:50 - 9:15)
        const checkInHour = 7 + Math.floor(Math.random() * 2);
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkIn = new Date(day);
        checkIn.setHours(checkInHour, checkInMinute, 0);
        
        // คำนวณนาทีสาย (เกิน 8:30 = สาย)
        let lateMinutes = 0;
        if (checkInHour > 8 || (checkInHour === 8 && checkInMinute > 30)) {
            lateMinutes = (checkInHour - 8) * 60 + (checkInMinute - 30);
            if (lateMinutes < 0) lateMinutes = 0;
        }
        
        // เวลาออกงาน (17:00 - 18:30)
        const checkOutHour = 17 + Math.floor(Math.random() * 2);
        const checkOutMinute = Math.floor(Math.random() * 60);
        const checkOut = new Date(day);
        checkOut.setHours(checkOutHour, checkOutMinute, 0);
        
        attendanceData.push({
            userId: user._id,
            userName: user.name,
            checkIn: checkIn,
            checkOut: checkOut,
            lateMinutes: lateMinutes,
            date: day,
            createdAt: new Date()
        });
    });
});

db.attendances.insertMany(attendanceData);
print("✅ Attendance inserted: " + db.attendances.countDocuments() + " records");

// =============================================
// SUMMARY
// =============================================
print("\n========================================");
print("🎉 All data seeded successfully!");
print("========================================");
print("📊 Summary:");
print("   - Users: " + db.users.countDocuments());
print("   - Customers: " + db.customers.countDocuments());
print("   - Materials: " + db.materials.countDocuments());
print("   - Projects: " + db.projects.countDocuments());
print("   - Attendance: " + db.attendances.countDocuments());
print("========================================");
print("\n🔐 Login Credentials:");
print("   CEO: natthapong.cha@ku.th / 123456");
print("   CEO: ceo@sk.com / 123456");
print("   Employee: manee@sk.com / 123456");
print("========================================\n");
