const db = require('./db.js');

module.exports = {
    run() {
        Promise.resolve()
            // insert hello:world
            .then(() => {
                return db.create({
                    collection: "users",
                    data: {
                        hello: "world",
                        time: (new Date()).getTime(),
                        places_ids: [],
                    }
                })
            })
            // insert foo:bar
            .then(() => {
                return db.create({
                    collection: "users",
                    data: {
                        foo: "bar",
                        time: (new Date()).getTime(),
                        places_ids: [],
                    }
                })
            })
            // find all
            .then(() => {
                return db.find({collection: "users"})
                    .then(users => {
                        users.forEach(user => {
                            console.log(`* user`, user);
                        });
                    });
            })
            // update
            .then(() => {
                return db.update({
                    collection: "users",
                    filter: {},
                    data: { $set: { b : 1 } }
                });
            })
            // find all
            .then(() => {
                return db.find({collection: "users"})
                    .then(users => {
                        users.forEach(user => {
                            console.log(`** user`, user);
                        });
                    });
            })
            // delete foo:bar
            .then(() => {
                return db.delete({
                    collection: "users",
                    filter: {foo: "bar"},
                });
            })
            // find all
            .then(() => {
                return db.find({collection: "users"})
                    .then(users => {
                        users.forEach(user => {
                            console.log(`** user`, user);
                        });
                    });
            })
    }
};
