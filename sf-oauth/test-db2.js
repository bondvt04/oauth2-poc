// const db = require('./db.js');
const db = require('./db.js');

Promise.resolve()
// findById
    .then(() => {
        return db.findById({
            collection: "applications",
            //id: "5a84375b7ef043dd8e89a7ed"
            id: "5a84375b7ef043dd8e89a777"
        })
            .then(app => {

            })
            .catch(err => {
                console.error(`## err`, JSON.stringify(err));
            });
    });
