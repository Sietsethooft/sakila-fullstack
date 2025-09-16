const db = require('../models/db');

const revenueDao = {
    getRevenueThisMonth(callback) {
        const query = `
            SELECT SUM(amount) AS revenue_this_month
            FROM payment
            WHERE MONTH(payment_date) = MONTH(CURRENT_DATE())
              AND YEAR(payment_date) = YEAR(CURRENT_DATE());
        `;

        db.query(query, (err, results) => {
            if (err) return callback(err);
            const revenue = results[0]?.revenue_this_month || 0;
            callback(null, revenue);
        });
    }
};

module.exports = revenueDao;