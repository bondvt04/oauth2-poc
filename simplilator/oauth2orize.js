const oauth2orize = require('oauth2orize');
const server = oauth2orize.createServer();
const {
    Application,
    GrantCode,
    AccessToken
} = require('./oauth.js');

server.grant(oauth2orize.grant.code({
    scopeSeparator: [ ' ', ',' ]
}, function(application, redirectURI, user, ares, done) {
    GrantCode.create({
        application: application,
        user: user,
        scope: ares.scope
    })
        .then(grant_code => done(null, grant_code))
        .catch(done);
}));

server.exchange(oauth2orize.exchange.code({
    userProperty: 'app'
}, function(application, code, redirectURI, done) {
    GrantCode.findOne({ code })
        .then(grant => {
            if (grant && grant.active && grant.application == application.id) {
                const token = new AccessToken({
                    application: grant.application,
                    user: grant.user,
                    grant: grant,
                    scope: grant.scope
                });
                token.save(function(error) {
                    done(error, error ? null : token.token, null, error ? null : { token_type: 'standard' });
                });
            } else {
                done(new Error("Something goes wrong with server.exchange"), false);
            }
        })
        .catch(done);// @TODO consider to decide - maybe better to do "done(error, false)"
}));

server.serializeClient(function(application, done) {
    done(null, application.id);
});

server.deserializeClient(function(id, done) {
    Application.findById(id)
        .then(application => done(null, application))
        .catch(done)
});