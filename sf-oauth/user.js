const ObjectId = require('mongodb').ObjectId;
const Hash = require('password-hash');
const db = require('./db.js');

module.exports = {
    authenticate(email, password, callback) {
        return db.find({
            collection: "users",
            filter: {
                email,
            }
        })
            .then(users => {
                if (users && users[0] && Hash.verify(password, users[0].password_hash)) {
                    return users[0];
                }

                return undefined;
            })
            .catch(error => {
                let err = new Error(`Something bad happened with MongoDB: ${error.message}`);
                console.error(err);
                throw err;
            });
    },

    create(user = {}) {
        const email = user.email;
        const password = user.password;
        const password_hash = makeHashed(password);

        return db.create({
            collection: "users",
            data: {
                email,
                password_hash
            }
        });
    },

    findById(id) {
        const _id = new ObjectId(id);
        return db.find({
            collection: "users",
            filter: { _id }
        }).then(users => {
            return new Promise((resolve, reject) => {
                if (users && users[0]) {
                    resolve(users[0]);
                } else if(users && users[0]) {
                    let error = new Error("There is no such user");
                    reject(error);
                } else {
                    let error = new Error("Something bad happened with MongoDB");
                    reject(error);
                }
            });
        });
    },

    makeHashed(password) {
        return Hash.isHashed(password) ? password : Hash.generate(password);
    }
};
