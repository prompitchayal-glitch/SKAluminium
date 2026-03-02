// =============================================
// SK ALUMINIUM - MongoDB Seed Scripts
// Copy ทั้งหมดนี้ไปวางใน MongoDB Compass Shell
// =============================================

// 1. USERS
db.users.deleteMany({});
db.users.insertMany([
    { name: "สมชาย เจริญธุรกิจ", email: "ceo@sk.com", password: "123456", role: "CEO", createdAt: new Date() },
    { name: "natthapong", email: "natthapong.cha@ku.th", password: "123456", role: "CEO", createdAt: new Date() },
    { name: "มานี รักษ์งาน", email: "manee@sk.com", password: "123456", role: "EMPLOYEE", createdAt: new Date() },
    { name: "วิชัย ใจซื่อ", email: "wichai@sk.com", password: "123456", role: "EMPLOYEE", createdAt: new Date() },
    { name: "สมหญิง ดีใจ", email: "somying@sk.com", password: "123456", role: "EMPLOYEE", createdAt: new Date() }
]);

// 2. CUSTOMERS
db.customers.deleteMany({});
db.customers.insertMany([
    { name: "คุณธงชัย วงศ์สุวรรณ", phone: "081-234-5678", address: "55 หมู่บ้านแสนสิริ บางแค กรุงเทพฯ" },
    { name: "คุณเมย์ลดา ศรีสุข", phone: "089-876-5432", address: "1502 คอนโด Regent Home บางนา กรุงเทพฯ" },
    { name: "คุณวิชัย ธนาพรชัย", phone: "086-111-2222", address: "123 ตลาดหนองแขม กรุงเทพฯ" },
    { name: "บริษัท เดอะคอฟฟี่เฮาส์ จำกัด", phone: "02-123-4567", address: "999 อาคารเอ็มไพร์ สาทร กรุงเทพฯ" },
    { name: "คุณสมศักดิ์ รักษาสุข", phone: "084-555-6666", address: "45/12 ซอยประชาอุทิศ 33 ทุ่งครุ กรุงเทพฯ" },
    { name: "บริษัท โมเดิร์นโฮม จำกัด", phone: "02-987-6543", address: "88 ถนนรัชดาภิเษก ห้วยขวาง กรุงเทพฯ" }
]);

// 3. MATERIALS
db.materials.deleteMany({});
db.materials.insertMany([
    { name: "อลูมิเนียมเส้น สีขาว 1.5 นิ้ว", type: "NEW", quantity: 120, minimumThreshold: 20, unitPrice: 450 },
    { name: "อลูมิเนียมเส้น สีดำ 1.5 นิ้ว", type: "NEW", quantity: 85, minimumThreshold: 15, unitPrice: 480 },
    { name: "อลูมิเนียมเส้น สีชา 2 นิ้ว", type: "NEW", quantity: 45, minimumThreshold: 10, unitPrice: 520 },
    { name: "รางบานเลื่อนอลูมิเนียม", type: "NEW", quantity: 60, minimumThreshold: 10, unitPrice: 380 },
    { name: "กระจกใส 5 มม.", type: "NEW", quantity: 50, minimumThreshold: 10, unitPrice: 1200 },
    { name: "กระจกใส 6 มม.", type: "NEW", quantity: 35, minimumThreshold: 8, unitPrice: 1500 },
    { name: "กระจกสีชา 5 มม.", type: "NEW", quantity: 28, minimumThreshold: 5, unitPrice: 1400 },
    { name: "กระจกเงา 4 มม.", type: "NEW", quantity: 20, minimumThreshold: 5, unitPrice: 1800 },
    { name: "ยางขอบกระจก EPDM", type: "NEW", quantity: 500, minimumThreshold: 100, unitPrice: 15 },
    { name: "ซิลิโคนใส", type: "NEW", quantity: 80, minimumThreshold: 20, unitPrice: 120 },
    { name: "ซิลิโคนสีดำ", type: "NEW", quantity: 60, minimumThreshold: 15, unitPrice: 130 },
    { name: "มุ้งลวดไฟเบอร์กลาส", type: "NEW", quantity: 30, minimumThreshold: 5, unitPrice: 850 },
    { name: "มือจับประตูอลูมิเนียม สีเงิน", type: "NEW", quantity: 50, minimumThreshold: 10, unitPrice: 250 },
    { name: "มือจับประตูอลูมิเนียม สีดำ", type: "NEW", quantity: 35, minimumThreshold: 10, unitPrice: 280 },
    { name: "บานพับประตู 4 นิ้ว", type: "NEW", quantity: 100, minimumThreshold: 20, unitPrice: 85 },
    { name: "กลอนประตูสแตนเลส", type: "NEW", quantity: 40, minimumThreshold: 10, unitPrice: 180 },
    { name: "ล้อบานเลื่อน 25 มม.", type: "NEW", quantity: 200, minimumThreshold: 50, unitPrice: 35 },
    { name: "สกรูหัวจมดำ 1 นิ้ว", type: "NEW", quantity: 5000, minimumThreshold: 1000, unitPrice: 0.5 },
    { name: "เศษอลูมิเนียม (รวม)", type: "SCRAP", quantity: 150, minimumThreshold: 0, unitPrice: 45 },
    { name: "เศษกระจก", type: "SCRAP", quantity: 80, minimumThreshold: 0, unitPrice: 5 }
]);

// 4. PROJECTS (ต้องรันหลังจาก customers และ users แล้ว)
var cust = db.customers.find().toArray();
var emps = db.users.find({ role: "EMPLOYEE" }).toArray();
db.projects.deleteMany({});
db.projects.insertMany([
    { customerId: cust[0]._id, totalCost: 95000, totalPrice: 185000, paymentStatus: "partial", assignedTeam: [emps[0]._id, emps[1]._id], createdAt: new Date("2026-02-01") },
    { customerId: cust[1]._id, totalCost: 22000, totalPrice: 45000, paymentStatus: "unpaid", assignedTeam: [emps[0]._id], createdAt: new Date("2026-02-10") },
    { customerId: cust[2]._id, totalCost: 180000, totalPrice: 320000, paymentStatus: "paid", assignedTeam: [emps[0]._id, emps[1]._id, emps[2]._id], createdAt: new Date("2026-01-05") },
    { customerId: cust[3]._id, totalCost: 48000, totalPrice: 95000, paymentStatus: "partial", assignedTeam: [emps[1]._id, emps[2]._id], createdAt: new Date("2026-02-10") },
    { customerId: cust[4]._id, totalCost: 38000, totalPrice: 78000, paymentStatus: "unpaid", assignedTeam: [emps[0]._id], createdAt: new Date("2026-02-12") }
]);

// 5. ATTENDANCES
db.attendances.deleteMany({});
var emps2 = db.users.find({ role: "EMPLOYEE" }).toArray();
emps2.forEach(function(emp) {
    db.attendances.insertMany([
        { userId: emp._id, checkIn: new Date("2026-02-10T08:05:00"), checkOut: new Date("2026-02-10T17:30:00"), lateMinutes: 0 },
        { userId: emp._id, checkIn: new Date("2026-02-11T08:15:00"), checkOut: new Date("2026-02-11T17:45:00"), lateMinutes: 0 },
        { userId: emp._id, checkIn: new Date("2026-02-12T09:10:00"), checkOut: new Date("2026-02-12T18:00:00"), lateMinutes: 40 },
        { userId: emp._id, checkIn: new Date("2026-02-13T08:00:00"), checkOut: new Date("2026-02-13T17:15:00"), lateMinutes: 0 },
        { userId: emp._id, checkIn: new Date("2026-02-14T08:25:00"), checkOut: null, lateMinutes: 0 }
    ]);
});

// Summary
print("Done! Users:" + db.users.countDocuments() + " Customers:" + db.customers.countDocuments() + " Materials:" + db.materials.countDocuments() + " Projects:" + db.projects.countDocuments() + " Attendances:" + db.attendances.countDocuments());
