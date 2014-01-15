var db = require('./db');
var utils = require('./utils');
var BaseSchema = require('./base');

var User = new BaseSchema({
    name: String,
    password: String,
    email: String,
    avatar: String,
    lastLoginTime: String
}, { versionKey: false });


/**
 *  user login
 *
 *
 *  ####Note:
 *
 *      If you need other features, please use 'options'
 *
 *
 *  ####Examples:
 *
 *      A.login(username, password, options, callback)
 *      A.login(username, password, callback)
 *
 *
 *  @param {String} username
 *  @param {String} password
 *  @param {Object} [options]
 *  @param {Function} callback
 *  @return executes
 */
User.statics.login = function(username, password, options, callback) {
    if(typeof options == 'function') {
        callback = options;
        options = null;
    }

    var Model = this;
    var now = utils.formatDate(Date.now());
    password = utils.md5(password);

    Model.findOneAndUpdate({ name: username, password: password }, { lastLoginTime: now }, callback);
}

/**
 *  user login
 *
 *
 *  ####Note:
 *
 *      If you need other features, please use 'options'
 *
 *
 *  ####Examples:
 *
 *      A.login(username, password， email, options, callback)
 *      A.login(username, password， email, callback)
 *
 *
 *  @param {String} username
 *  @param {String} password
 *  @param {String} email
 *  @param {Object} [options]
 *  @param {Function} callback
 *  @return executes
 */
User.statics.register = function(username, password, email, options, callback) {
    if(typeof options == 'function') {
        callback = options;
        options = null;
    }

    var Model = this;

    Model.findOne({ name: username }, function(err, item) {
        if(item){
            err = '用户已存在！';
        }

        if(!err){
            var user = new Model(options);
            user.name = username;
            user.password = utils.md5(password);
            user.email = email;
            user.avatar = utils.getAvatarByEmail(email);
            user.lastLoginTime = utils.formatDate(Date.now());
            user.save(callback);
        }
        else {
            callback(err);
        }
    })
}

module.exports = db.model('User', User);