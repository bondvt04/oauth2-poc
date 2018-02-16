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
                    console.log(data, newGrantCode);
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
    }
};
const AccessToken = {
    collection: "access_tokens",

    create(data) {
        data = {
            token = uid(124),// string
            user = throwIfMissing(),// ObjectId=user._id
            application = throwIfMissing(),// ObjectId=application._id
            grant = throwIfMissing(),// ObjectId=grant_code._id
            scope = [],// array of strings
            expires = (() => {
                const today = new Date();
                const length = 5; // Length (in minutes) of our access token
                return new Date(today.getTime() + length * 60000);
            })(),
            active = true// get: function(value) {if(expires < new Date() || !value){false}else{value}}
        } = data;
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
