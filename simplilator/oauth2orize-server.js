const url = require('url');
const passport = require('passport');
const oauth2orize = require('oauth2orize');
const server = oauth2orize.createServer();
const {
    Application,
    GrantCode,
    AccessToken
} = require('./oauth2orize-models.js');

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
    done(null, application._id);
});

server.deserializeClient(function(id, done) {
    Application.findById(id)
        .then(application => done(null, application))
        .catch(done)
});

module.exports = (app) => {
    app.get('/auth/start', server.authorize(function(applicationID, redirectURI, done) {
        Application.findOne({ oauth_id: applicationID })
            .then(application => {
                    if (application) {
                        let match = false, uri = url.parse(redirectURI || '');
                        for (let i = 0; i < application.domains.length; i++) {
                            if (uri.host == application.domains[i] || (uri.protocol == application.domains[i] && uri.protocol != 'http' && uri.protocol != 'https')) {
                                match = true;
                                break;
                            }
                        }
                        if (match && redirectURI && redirectURI.length > 0) {
                            done(null, application, redirectURI);
                        } else {
                            done(new Error("You must supply a redirect_uri that is a domain or url scheme owned by your app."), false);
                        }
                    } else {
                        done(new Error("There is no app with the client_id you supplied."), false);
                    }
            })
            .catch((error) => {
                done(error)
            });
    }), function(req, res) {

        const scopeMap = {
            // ... display strings for all scope variables ...
            view_account: 'view your account',
            edit_account: 'view and edit your account',
        };

        res.render('oauth', {
            transaction_id: req.oauth2.transactionID,
            currentURL: req.originalUrl,
            response_type: req.query.response_type,
            errors: req.flash('error'),
            scope: req.oauth2.req.scope,
            application: req.oauth2.client,
            user: req.user,
            map: scopeMap
        });
    });
    app.post('/auth/finish', function(req, res, next) {
        if (req.user) {
            next();
        } else {
            passport.authenticate('local', {
                session: false
            }, function(error, user, info) {
                if (user) {
                    next();
                } else if (!error) {
                    req.flash('error', 'Your email or password was incorrect. Try again.');
                    res.redirect(req.body['auth_url'])
                }
            })(req, res, next);
        }
    }, server.decision(function(req, done) {
        done(null, { scope: req.oauth2.req.scope });
    }));

    app.post('/auth/exchange', function(req, res, next){
        const appID = req.body['client_id'];
        const appSecret = req.body['client_secret'];

        Application.findOne({ oauth_id: appID, oauth_secret: appSecret })
            .then(application => {
                if (application) {
                    req.app = application;
                    next();
                } else {
                    error = new Error("There was no application with the Application ID and Secret you provided.");
                    next(error);
                }
            })
            .catch(next)

        Application.findOne({ oauth_id: appID, oauth_secret: appSecret }, function(error, application) {
            if (application) {
                req.app = application;
                next();
            } else if (!error) {
                error = new Error("There was no application with the Application ID and Secret you provided.");
                next(error);
            } else {
                next(error);
            }
        });
    }, server.token(), server.errorHandler());
};