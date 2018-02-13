const uid = require('uid2');
const db = require('./db.js');

const Application = {
    collection: "applications",

    create(data = {
        title: throwIfMissing(),// string
        oauth_id: throwIfMissing(),// number
        oauth_secret: uid(42),// string
        domains: []// array of strings
    }) {
        return db.create({
            collection: this.collection,
            data
        });
    },

    findById(id) {
        return db.findById({
            collection: this.collection,
            id
        });
    }
};

const GrantCode = {
    collection: "grant_codes",

    create(data = {
        code: uid(24),// string
        user: throwIfMissing(),// ObjectId=user._id
        application: throwIfMissing(),// ObjectId=application._id
        scope: [],// array of strings
        active: true// boolean
    }) {
        return new Promise((resolve, reject) => {
            db.create({
                collection: this.collection,
                data
            })
                .then(() => resolve(data.code))
                .catch(reject)
        });
    },

    findOne(filter) {
        return db.findOne({
            collection: this.collection,
            filter
        });
    }
};
const AccessToken = {
    collection: "access_tokens",

    create(data = {
        token: uid(124),// string
        user: throwIfMissing(),// ObjectId=user._id
        application: throwIfMissing(),// ObjectId=application._id
        grant: throwIfMissing(),// ObjectId=grant_code._id
        scope: [],// array of strings
        expires: (() => {
            const today = new Date();
            const length = 60; // Length (in minutes) of our access token
            return new Date(today.getTime() + length * 60000);
        })(),
        active: true// get: function(value) {if(expires < new Date() || !value){false}else{value}}
    }) {
        return db.create({
            collection: this.collection,
            data
        });
    }
};

function throwIfMissing() {
    throw new Error('Missing parameter');
}

module.exports = {
    Application,
    GrantCode,
    AccessToken
};
