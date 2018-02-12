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
    create: (options = {}) => {
        return dbConnection
            .then((client) => {
                const collection = options.collection || 'users';
                const data = options.data || {};
                return client.collection(collection).insertOne(data);
            })
            .catch(this.catch);
    },
    // cRud
    find: (options = {}) => {
        return dbConnection
            .then((client) => {
                const collection = options.collection || 'users';
                const filter = options.filter || {};
                return new Promise((resolve, reject) => {
                    client.collection(collection).find(filter).toArray(function(error, docs) {
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
    // crUd
    update: (options = {}) => {
        return dbConnection
            .then((client) => {
                const collection = options.collection || 'users';
                const filter = options.filter || {};
                const data = options.data || {};

                return new Promise((resolve, reject) => {
                    client.collection(collection).update(filter, data, (error, result) => {
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
    delete: (options = {}) => {
        return dbConnection
            .then((client) => {
                const collection = options.collection || 'users';
                const filter = options.filter || {};

                return new Promise((resolve, reject) => {
                    client.collection(collection).deleteMany(filter, (error, result) => {
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
}
