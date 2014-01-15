var Schema = require('mongoose').Schema;
var db = require('./db');

var Counter = new Schema({
    _id: String,
    seq: Number
});

/**
 *  get next id which design by auto increase
 *
 *
 *  ####Examples:
 *
 *      A.getNextId('post', callback)
 *      A.getNextId('user', callback)
 *
 *
 *  @param {String} name
 *  @param {Function} callback
 *  @return executes
 */
Counter.statics.getNextId = function(name, callback) {
    this.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true }, function(err, counter) {
        callback(err, counter.seq);
    });
};

module.exports = db.model('Counter', Counter);