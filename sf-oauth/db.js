const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const dbConnection = (function initDB() {
    let config = {
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
    create({
        collection = throwIfMissing(),
        data = {}
    }) {
        return dbConnection
            .then((client) => {
                return client.collection(collection).insertOne(data);
            })
            .catch(this.catch);
    },
    // cRud
    find({
        collection = throwIfMissing(),
        filter = {}
    }) {
        return dbConnection
            .then((client) => {
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
    // cRud
    findOne({
        collection = throwIfMissing(),
        filter = {}
    }) {
        return dbConnection
            .then((client) => {
                return new Promise((resolve, reject) => {
                    client.collection(collection).find(filter).toArray(function(error, docs) {
                        if (error) {
                            reject(error);
                            return;
                        }

                        if (docs && docs[0]) {
                            resolve(docs[0]);
                            return;
                        }

                        reject(new Error(`No documents for collection "${collection}" and filter "${JSON.stringify(filter)}"`));
                    });
                });
            })
            .catch(this.catch);
    },
    // cRud
    findById({
        collection = throwIfMissing(),
        id = throwIfMissing()
    }) {
        const _id = new ObjectId(id);
        return this.findOne({
            collection,
            filter: { _id }
        })
    },
    // crUd
    update({
        collection = throwIfMissing(),
        filter = {},
        data = {}
    }) {
        return dbConnection
            .then((client) => {
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
    delete({
        collection = throwIfMissing(),
        filter = {}
    }) {
        return dbConnection
            .then((client) => {
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

    catch(error) {
        console.log(`### ERROR ###`, error);
        throw error;
    },

    //disconnect: dbConnection.close
    disconnect() {
        return dbConnection
            .then(client => client.close())
    }
};

function throwIfMissing() {
    throw new Error('Missing parameter');
}
