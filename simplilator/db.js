const MongoClient = require('mongodb').MongoClient;
const dbConnection = (function initDB() {
    var config = {
        defaults: {
            host: 'localhost',
            port: 27017,
            replicaset: '',
            user: 'mongo',
            pwd: '',
            name: 'test',
        },
        dev: {
            user: 'georgio',
            pwd: 'devpwd',
            name: 'simplifield_dev',
        },
    };
    config = config.defaults;

    const replicasetOpt =
        '' !== config.replicaset ? `?replicaSet=${config.replicaset}` : '';
    const url = `mongodb://${config.host}${
        config.port ? `:${config.port}` : ''
        }/${config.name}${replicasetOpt}`;

    return MongoClient.connect(url).then(client =>
        Object.assign(client.db(config.name), { client }, { close: client.close })
    );
})();

dbConnection
    .then((result) => {
        console.log(`*CONNECTED*`);
    })
    .catch((error) => {
        console.log(`*CONNECTION_ERROR*`, error);
    });

module.exports = {
    // Crud
    create: (options = {
        collection: throwIfMissing(),
        data: {}
    }) => {
        return dbConnection
            .then((client) => {
                return client.collection(options.collection).insertOne(options.data);
            })
            .catch(this.catch);
    },
    // cRud
    find: (options = {
        collection: throwIfMissing(),
        filter: {}
    }) => {
        return dbConnection
            .then((client) => {
                return new Promise((resolve, reject) => {
                    client.collection(options.collection).find(options.filter).toArray(function(error, docs) {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(docs);
                    });
                });
            })
            .catch(this.catch);
    },
    // cRud
    findOne: (options = {
        collection: throwIfMissing(),
        filter: {}
    }) => {
        return dbConnection
            .then((client) => {
                return new Promise((resolve, reject) => {
                    client.collection(options.collection).find(options.filter).toArray(function(error, docs) {
                        if (error) {
                            reject(error);
                            return;
                        }

                        if (docs && docs[0]) {
                            resolve(docs[0]);
                            return;
                        }

                        reject(new Error(`No documents for collection "${options.collection}" and filter "${options.filter}"`));
                    });
                });
            })
            .catch(this.catch);
    },
    // cRud
    findById: (options = {
        collection: throwIfMissing(),
        id: throwIfMissing()
    }) => {
        return this.findById({
            collection: options.collection,
            filter: {
                _id: options.id
            }
        })
    },
    // crUd
    update: (options = {
        collection: throwIfMissing(),
        filter: {},
        data: {}
    }) => {
        return dbConnection
            .then((client) => {
                return new Promise((resolve, reject) => {
                    client.collection(options.collection).update(options.filter, options.data, (error, result) => {
                        if(error) {
                            reject(error);
                            return;
                        }

                        resolve(result);
                    });
                });
            })
            .catch(this.catch);
    },
    // cruD
    delete: (options = {
        collection: throwIfMissing(),
        filter: {}
    }) => {
        return dbConnection
            .then((client) => {
                return new Promise((resolve, reject) => {
                    client.collection(options.collection).deleteMany(options.filter, (error, result) => {
                        if(error) {
                            reject(error);
                            return;
                        }

                        resolve(result);
                    });
                });
            })
            .catch(this.catch);
    },

    catch: (error) => {
        console.log(`### ERROR ###`, error);
    }
};

function throwIfMissing() {
    throw new Error('Missing parameter');
}
