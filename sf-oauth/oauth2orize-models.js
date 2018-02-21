const uid = require('uid2');
const db = require('./db.js');

const Application = {
    collection: "applications",

    create(data) {
        const data = {
            title = throwIfMissing(),// string
            oauth_id = throwIfMissing(),// number
            oauth_secret = uid(42),// string
            domains = []// array of strings
        } = data;
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
    },

    findOne(filter) {
        return db.findOne({
            collection: this.collection,
            filter
        });
    }
};

const GrantCode = {
    collection: "grant_codes",

    create(data) {
        data.code = data.code || uid(24);
        data.user = data.user !== undefined ? data.user : throwIfMissing();
        data.application = data.application !== undefined ? data.application : throwIfMissing();
        data.scope = data.scope || [];
        data.active = data.active !== undefined ? data.active : true;

        return new Promise((resolve, reject) => {
            db.create({
                collection: this.collection,
                data
            })
                .then((newGrantCode) => {
                    resolve(data.code);
                })
                .catch(reject)
        });
    },

    findOne(filter) {
        return db.findOne({
            collection: this.collection,
            filter
        });
    },

    findById(id) {
        return db.findById({
            collection: this.collection,
            id
        });
    }
};
const AccessToken = {
    collection: "access_tokens",

    create(data) {
        data.token = data.token || uid(124);
        data.user = data.user !== undefined ? data.user : throwIfMissing();
        data.application = data.application !== undefined ? data.application : throwIfMissing();
        data.grant = data.grant !== undefined ? data.grant : throwIfMissing();
        data.scope = data.scope || [];
        data.expires = (() => {
            const today = new Date();
            const length = 5; // Length (in minutes) of our access token
            return new Date(today.getTime() + length * 60000);
        })();
        data.active = data.active !== undefined ? data.active : true;

        return db.create({
            collection: this.collection,
            data
        });
    },

    findOne(filter) {
        return db.findOne({
            collection: this.collection,
            filter
        });
    },

    findById(id) {
        return db.findById({
            collection: this.collection,
            id
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
