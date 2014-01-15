var mongoose = require('mongoose');
var dbsettings = require('../settings').db;

module.exports = mongoose.createConnection(dbsettings.url);