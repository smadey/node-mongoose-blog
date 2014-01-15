var Schema = require('mongoose').Schema;
var marked = require('marked');
var db = require('./db');
var utils = require('./utils');
var BaseSchema = require('./base');

var options = {
    versionKey: false,
    minimize: false
}

var Comment = new Schema({
    email: String,
    avatar: String,
    website: String,
    content: String,
    creator: String,
    createTime: Number,
    time: String
}, options);

// // set comment time and do not insert to db
// Comment.path('createTime').default(Date.now);
// Comment.pre('init', function(done, obj) {
//     obj.time = utils.formatDate(obj.createTime);
//     return obj;
// });

var Post = new BaseSchema({
    title: String,
    tags: Array,
    content: String,
    creator: String,
    avatar: String,
    comments: [Comment],
    pv: Array,
    reprint: { type: Object, default: {} },
    lastUpdateTime: String
}, options);

Post.pre('save', function(next) {
    if(this.isNew) {
        this.lastUpdateTime = utils.formatDate(Date.now());
    }
    next();
})

Post.post('remove', function(v) {
    debugger;
    console.log(v);
});

Post.statics.findByPage = function(query, pageIndex, pageSize, callback) {
    var Model = this;
    Model.count(query, function(err, total) {
        var options = {
            sort: { lastUpdateTime: -1 },
            lean: true
        };
        if(pageIndex > 0 && pageSize > 0) {
            options.skip = (pageIndex - 1) * pageSize;
            options.limit = pageSize;
        }

        Model.find(query, null, options, function(err, items) {
            items.forEach(function(item) {
                item.content = marked(item.content);
            });
            callback(err, items, total);
        });
    });
}

Post.statics.edit = function(id, username, post, callback) {
    post.lastUpdateTime = utils.formatDate(Date.now());
    this.findOneAndUpdate({ _id: id, creator: username }, post, callback);
}

Post.statics.reprint = function(id, username, newPost, callback) {
    var Model = this;

    Model.findById(id).lean().exec(function(err, item) {
        if(err || !item) {
            return callback(err || 404);
        }

        var newItem = new Model(newPost);
        newItem.title = /[转载]/.test(item.title) ? item.title : ('[转载]' + item.title);
        newItem.tags = item.tags;
        newItem.content = item.content;
        newItem.creator = username;
        newItem.reprint = { from: { id: item._id, creator: item.creator } };

        newItem.save(function(err, newItem) {
            // item.reprint.to = item.reprint.to || [];
            // item.reprint.to.push({ id: newItem._id, creator: newItem.creator });
            // // item.reprint = { to: [{ id: newItem._id, creator: newItem.creator }]};
            // return item.save(function(err, item) {
            //     callback(err, newItem);
            // });
            var to = { id: newItem._id, creator: newItem.creator };
            return Model.findByIdAndUpdate(id, { $push: { 'reprint.to': to } }, function(err, item) {
                callback(err, newItem);
            });
        });
    });
}

Post.statics.delete = function(id, username, callback) {
    var Model = this;

    return Model.findOneAndRemove({ _id: id , creator: username }, function(err, item) {
        if(err) {
            return callback(err);
        }
        else if(!item || !item.reprint || !item.reprint.from) {
            return callback(null);
        }

        var to = { id: item._id, creator: item.creator };
        Model.findByIdAndUpdate(item.reprint.from.id, { $pull: { 'reprint.to': to }}, callback);
    })
}

Post.statics.view = function(id, username, callback) {
    this.findById(id, function(err, item) {
        if(item) {
            if(item.pv.indexOf(username) == -1) {
                item.pv.push(username);
                item.save();
            }
            item = item.toObject();
            item.content = marked(item.content);
            item.comments.forEach(function(comment) {
                comment.content = marked(comment.content);
            });
        }
        callback(err, item);
    });
}

Post.statics.publishComment = function(id, comment, callback) {
    // set comment time and insert to db
    comment.createTime = Date.now();
    comment.time = utils.formatDate(comment.createTime);

    this.update({ _id: id }, { $push: { comments: comment }}, callback);
}

module.exports = db.model('Post', Post);