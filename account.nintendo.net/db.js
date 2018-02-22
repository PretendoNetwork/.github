let mongoist = require('mongoist'),
    config = require('./config.json'),
    user_database_name = 'nintendo_acts',
    user_database_collection_name = 'users',
    user_database, user_collection;

let username = config.mongo.nintendo_acts.username;
let password = config.mongo.nintendo_acts.password;
let hostname = config.mongo.nintendo_acts.hostname;
let connection_string = 'mongodb://' + username + ':' + password + '@' + hostname + '/' + user_database_name + '?authSource=admin';

user_database = mongoist(connection_string);
user_collection = user_database.collection(user_database_collection_name);

module.exports = {
    user_database: user_database,
    user_collection: user_collection
};