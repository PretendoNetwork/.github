let mongojs = require('mongojs'),
    mongoist = require('mongoist'),
    user_database_name = 'nintendo_acts',
    user_database_collection_name = 'users',
    user_database, user_collection;

user_database = mongoist(mongojs(user_database_name));
user_collection = user_database.collection(user_database_collection_name);

module.exports = {
    user_database: user_database,
    user_collection: user_collection
};