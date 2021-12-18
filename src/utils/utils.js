const bcrypt = require('bcrypt');

function encryptPassword(req) {
   return new Promise((resolve, reject) => {
    bcrypt.hash(req.password, 10)
    .then((hash) => {
        let user = {
            username: req.username,
            email: req.email,
            password: hash
        };
        resolve(user);
    })
    .catch((err) => {
        reject(err);
    });

   });                
}

module.exports = {
    encryptPassword
};