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
    },
    {
        collection: "users",
        data: {
            "email" : "asdf@asdf.com",
            "password_hash" : "sha1$823ecb69$1$30235c5078029e5ba29a9d8d8143731d5c1fd454"
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
