const db = require('../models/db');
const bcrypt = require('bcrypt');

const saltRounds = 10;

db.query('SELECT staff_id, password FROM staff', (err, users) => {
    if (err) throw err;

    users.forEach(user => {
        // Alleen als het wachtwoord nog niet gehasht is
        if (!user.password.startsWith('$2b$')) {
            bcrypt.hash(user.password, saltRounds, (hashErr, hash) => {
                if (hashErr) throw hashErr;

                db.query('UPDATE staff SET password = ? WHERE staff_id = ?', [hash, user.staff_id], (updateErr) => {
                    if (updateErr) throw updateErr;
                    console.log(`Password for user ${user.staff_id} updated.`);
                });
            });
        }
    });
});