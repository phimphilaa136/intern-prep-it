const db = require('./db');

const OpenRegistration = {
  async getAll() {
    const [rows] = await db.query('SELECT *, agency_name, capacity, location, phone_number, status, created_at, updated_at FROM tb_open_for_students');
    return rows;
  },
  // สามารถเพิ่มฟังก์ชันอื่นๆ เช่น create, update, delete ได้ในอนาคต
};

module.exports = OpenRegistration;
