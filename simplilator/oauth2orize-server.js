const url = require('url');
const passport = require('passport');
const oauth2orize = require('oauth2orize');
const server = oauth2orize.createServer();
const bodyParser = require('body-parser');
const PassportOAuthBearer = require('passport-http-bearer');
const {
    Application,
    GrantCode,
    AccessToken
} = require('./oauth2orize-models.js');

server.grant(oauth2orize.grant.code({
    scopeSeparator: [ ' ', ',' ]
}, function(application, redirectURI, user, ares, done) {
    GrantCode.create({
        application: application._id,
        user: user ? user._id : null,
        scope: ares.scope
    })
        .then(grant_code => {
            done(null, grant_code);
        })
        .catch(error => {
            done(error);
        });
}));

server.exchange(oauth2orize.exchange.code({
    userProperty: 'app'
}, function(application, code, redirectURI, done) {
    GrantCode.findOne({ code })
        .then(grant => {
            if (grant && grant.active && grant.application.toString() == application._id.toString()) {

                AccessToken.create({
                    application: grant.application,
                    user: grant.user,
                    grant: grant._id,
                    scope: grant    .scope
                })
                    .then(result => {
                        const token = result.ops[0];
                        done(undefined, token.token, null, { token_type: 'standard' });
                    })
                    .catch(error => {
                        done(error, null, null, null);
                    });
            } else {
                done(new Error("Something goes wrong with server.exchange"), false);
            }
        })
        .catch((error) => {
            done(error);
        });// @TODO consider to decide - maybe better to do "done(error, false)"
}));

server.serializeClient(function(application, done) {
    done(null, application._id);
});

server.deserializeClient(function(id, done) {
    Application.findById(id)
        .then(app => {
            done(null, app)
        })
        .catch(error => {
            done(error);
        })
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
    app.post('/auth/finish', bodyParser.urlencoded({ extended: false }), function(req, res, next) {
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
    // }, function(req, res, asdf) {
    //     console.log(req, res, asdf);
    // });
    }, server.decision(function(req, done) {
        done(null, { scope: req.oauth2.req.scope });
    }));

    app.post('/auth/exchange', bodyParser.json(), function(req, res, next){
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
    }, server.token(), server.errorHandler());



    const accessTokenStrategy = new PassportOAuthBearer(function(token, done) {
        AccessToken.findOne({ token: token }).populate('user').populate('grant').exec(function(error, token) {
            if (token && token.active && token.grant.active && token.user) {
                done(null, token.user, { scope: token.scope });
            } else if (!error) {p
                done(null, false);
            } else {
                done(error);
            }
        });
    });

    passport.use(accessTokenStrategy);

    app.post('/api/secured_resource',
        passport.authenticate('bearer', { session: false }),
        function(req, res, next) {
            //res.json(req.user);
            res.json('hello, world!');
        }
    );
};
