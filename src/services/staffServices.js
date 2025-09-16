const staffDao = require('../dao/staffDao');

const staffServices = {
    getStoreIdByStaffId(staff_id, callback) {
        staffDao.getStoreIdByStaffId(staff_id, callback);
    }
};  

module.exports = staffServices;