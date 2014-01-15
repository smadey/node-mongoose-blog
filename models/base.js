var util = require('util');
var Schema = require('mongoose').Schema;
var counter = require('./counter');
var utils = require('./utils');

/**
 *  Base Schema constructor.
 *
 *  ####Example:
 *
 *      var user = new BaseSchema({ name: String });
 *      var post = new BaseSchema({ content: String });
 *
 *      // setting schema options
 *      new BaseSchema({ name: String }, { _id: false, autoIndex: false })
 *
 *  ####Options:
 *
 *  - [autoIndex](/docs/guide.html#autoIndex): bool - defaults to true
 *  - [bufferCommands](/docs/guide.html#bufferCommands): bool - defaults to true
 *  - [capped](/docs/guide.html#capped): bool - defaults to false
 *  - [collection](/docs/guide.html#collection): string - no default
 *  - [id](/docs/guide.html#id): bool - defaults to true
 *  - [_id](/docs/guide.html#_id): bool - defaults to true
 *  - `minimize`: bool - controls [document#toObject](#document_Document-toObject) behavior when called manually - defaults to true
 *  - [read](/docs/guide.html#read): string
 *  - [safe](/docs/guide.html#safe): bool - defaults to true.
 *  - [shardKey](/docs/guide.html#shardKey): bool - defaults to `null`
 *  - [strict](/docs/guide.html#strict): bool - defaults to true
 *  - [toJSON](/docs/guide.html#toJSON) - object - no default
 *  - [toObject](/docs/guide.html#toObject) - object - no default
 *  - [versionKey](/docs/guide.html#versionKey): bool - defaults to "__v"
 *
 *
 *  @param {Object} definition
 *  @inherits NodeJS EventEmitter http://nodejs.org/api/events.html#events_class_events_eventemitter
 *  @event `init`: Emitted after the schema is compiled into a `Model`.
 *  @api public
 */
function BaseSchema() {
    Schema.apply(this, arguments);

    this.callQueue = [ [ 'pre', [ 'save', beforeSave ] ] ];

    this.add({
        _id: Number,
        createTime: Number,
        modifyTime: Number
    });
}

/**
 *  set default value before save to db
 *
 *
 *  @param {Function} next
 */
function beforeSave(next) {
    var model = this;

    if(model.isNew) {
        model.modifyTime = model.createTime = Date.now();
        counter.getNextId(model.collection.name + '_id', function(err, id) {
            model._id = id;
            next();
        });
    }
    else {
        model.modifyTime = Date.now();
        next();
    }
}

util.inherits(BaseSchema, Schema);

module.exports = BaseSchema;
