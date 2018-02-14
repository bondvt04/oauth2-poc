const db = require('./db.js');

const fixtures = [
    {
        collection: "applications",
        data: {
            "title" : "salesforce-plugin",
            "oauth_id" : "OAUTH_ID",
            "oauth_secret" : "-",
            "domains" : [
                "google.com"
            ],
            "scopes111" : [
                "edit_account",
                "do_things",
                "do_stuff"
            ]
        }
    }
];

Promise.resolve()
    .then(() => {
        return Promise.all([]
            .concat(
                fixtures.map(fix => db.create({
                    collection: fix.collection,
                    data: fix.data
                }))
            )
        );
    })
    .then(db.disconnect)
    .then(() => {
        console.log(`done`);
    })
    .catch((error) => {
        console.error(`Some error occurred ${error.message}`);
    });
