
var crypto = require('crypto'),
    fs = require('fs'),
    utils = require('../models/utils'),
    User = require('../models/user'),
    Post = require('../models/post');

module.exports = function(app) {

    app.get('/', function(req, res) {
        var pageIndex = req.query.p && parseInt(req.query.p) >= 0 ? parseInt(req.query.p) : 1,
            pageSize = req.query.s && parseInt(req.query.s) > 0 ? parseInt(req.query.s) : 10;

        Post.findByPage(null, pageIndex, pageSize, function(err, posts, total) {
            if(err) {
                posts = [];
            }

            res.render('index', {
                title: 'home',
                user: req.session.user,
                posts: posts,
                pageIndex: pageIndex,
                pageSize: pageSize,
                totalCount: total,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });

        });
    });

    app.get('/archive', function(req, res) {
        Post.find(function(err, posts) {
            if(err) {
                posts = [];
            }

            res.render('archive', {
                title: 'archive',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });

        });
    });

    app.get('/tags', function(req, res) {
        Post.distinct('tags', function(err, tags) {
            if(err) {
                tags = [];
            }

            res.render('tags', {
                title: 'tags',
                user: req.session.user,
                tags: tags,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });

        });
    });

    app.get('/tags/:tag', function(req, res) {
        var tag = req.params.tag;
        Post.find({ tags: tag }).lean().exec(function(err, posts) {
            if(err) {
                posts = [];
            }

            res.render('tag', {
                title: 'tag',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });

        });
    });


    app.get('/links', function(req, res) {
        res.render('links', {
            title: 'links',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });


    app.get('/search', function(req, res) {
        var keyword = req.query.keyword;
        Post.find({ title: new RegExp("^.*" + req.query.keyword + ".*$", "i") }, function(err, posts) {
            if(err) {
                posts = [];
            }

            res.render('search', {
                title: 'search',
                user: req.session.user,
                posts: posts,
                keyword: keyword,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });

        });
    });


    app.get('/post', checkLogin);
    app.get('/post', function(req, res){
        res.render('post', {
            title: 'post',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/post', checkLogin);
    app.post('/post', function(req, res){
        var options = req.body;
        options.tags = Array.isArray(options.tags) ? options.tags : options.tags == null ? [] : [options.tags];
        options.creator = req.session.user.name;
        options.avatar = req.session.user.avatar;

        var post = new Post(options);
        post.save(function(err) {
            if(err) {
                req.flash('error', err.toString());
                return res.redirect('/');
            }

            req.flash('success', '发布成功！');
            res.redirect('/');
        });
    });


    app.get('/u/:creator', function(req, res) {
        var username = req.params.creator,
            pageIndex = req.query.p && parseInt(req.query.p) >= 0 ? parseInt(req.query.p) : 1,
            pageSize = req.query.s && parseInt(req.query.s) > 0 ? parseInt(req.query.s) : 10;

        Post.findByPage({ creator: username }, pageIndex, pageSize, function(err, posts, total) {
            if(err) {
                req.flash('error', err.toString());
                return res.redirect('/');
            }

            res.render('user', {
                title: username,
                user: req.session.user,
                posts: posts,
                pageIndex: pageIndex,
                pageSize: pageSize,
                totalCount: total,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    app.get('/u/:creator/:id', function(req, res) {
        var post_id = req.params.id,
            username = req.session.user && req.session.user.name || utils.getClientIP(req);

        Post.view(post_id, username, function(err, post) {
            if(err || !post) {
                req.flash('error', err.toString() || '该博客未找到！');
                return res.redirect('/');
            }

            res.render('article', {
                title: post.title,
                user: req.session.user,
                post: post,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        });
    });

    app.post('/u/:creator/:id', function(req, res) {
        var post_id = req.params.id,
            comment = req.body;

        comment.avatar = utils.getAvatarByEmail(comment.email);

        Post.publishComment(post_id, comment, function(err) {
            if(err) {
                req.flash('error', err.toString());
            }
            else {
                req.flash('success', '留言成功！');
            }

            res.redirect('back');
        });
    });


    app.get('/edit/:creator/:id', checkLogin);
    app.get('/edit/:creator/:id', function(req, res) {
        var post_id = req.params.id,
            username = req.session.user.name;

        Post.findOne({ _id: post_id, creator: username }, function(err, post) {
            if(err || !post) {
                req.flash('error', err.toString() || '该博客未找到！');
                return res.redirect('/');
            }

            res.render('edit', {
                title: post.title,
                user: req.session.user,
                post: post,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        });
    });

    app.post('/edit/:creator/:id', checkLogin);
    app.post('/edit/:creator/:id', function(req, res) {
        var post_id = req.params.id,
            options = req.body,
            creator = req.session.user.name;
        options.tags = Array.isArray(options.tags) ? options.tags : options.tags == null ? [] : [options.tags];

        Post.edit(post_id, creator, options, function(err) {
            if(err) {
                req.flash('error', err.toString());
                return res.redirect('/');
            }

            req.flash('success', '修改成功！');
            res.redirect('/');
        });
    });

    app.get('/remove/:creator/:id', checkLogin);
    app.get('/remove/:creator/:id', function(req, res) {
        var post_id = req.params.id,
            username = req.session.user.name;

        Post.delete(post_id, username, function(err) {
            if(err) {
                req.flash('error', err.toString());
                return res.redirect('/');
            }

            req.flash('success', '删除成功！');
            res.redirect('/');
        });
    });

    app.get('/reprint/:creator/:id', checkLogin);
    app.get('/reprint/:creator/:id', function(req, res) {
        var post_id = req.params.id,
            username = req.session.user.name,
            newPost = { avatar: req.session.user.avatar };

        Post.reprint(post_id, username, newPost, function(err, item) {
            if(err) {
                req.flash('error', err.toString());
                return res.redirect('/');
            }

            req.flash('success', '转载成功！');
            res.redirect('/u/' + item.creator + '/' + item._id);
        });
    });


    app.get('/upload', checkLogin);
    app.get('/upload', function (req, res) {
        res.render('upload', {
            title: 'upload',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/upload', checkLogin);
    app.post('/upload', function (req, res) {
        for(var i in req.files) {
            if(req.files[i].size == 0) {
                fs.unlinkSync(req.files[i].path); // 使用同步方式删除一个文件
                console.log('Successfuly removed an empty file!');
            }
            else {
                var target_path = './public/images/' + req.files[i].name;
                fs.renameSync(req.files[i].path, target_path); // 使用同步方式重命名一个文件
                console.log('Successfuly renamed a file!');
            }
        }
        req.flash('success', '文件上传成功！');
        res.redirect('/upload');
    });


    app.get('/login', checkNotLogin);
    app.get('/login', function(req, res) {
        res.render('login', {
            title: 'login',
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/login', checkNotLogin);
    app.post('/login',function(req,res){
        var username = req.body.name, password = req.body.password;

        User.login(username, password, function(err, user) {
            if(err) {
                req.flash('success', '登陆失败！');
                return res.redirect('/login');
            }
            if(!user) {
                req.flash('error', '用户名或密码错误！');
                return res.render('login', {
                    title: 'login',
                    name: username,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            }
            req.session.user = user;
            req.flash('success', '登陆成功！');
            res.redirect('/');

        });
    });


    app.get('/reg', checkNotLogin);
    app.get('/reg', function(req, res) {
        res.render('reg', {
            title: 'register',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/reg', checkNotLogin);
    app.post('/reg', function(req, res){
        var options = req.body;

        if(options.password2 !== options.password){
            req.flash('error', '两次输入的密码不一致!');
            return res.redirect('/reg');
        }

        User.register(options.name, options.password, options.email, function(err, user) {
            if(err){
                req.flash('error', err.toString());
                return res.redirect('/reg');
            }

            req.session.user = user.toObject();
            req.flash('success', '注册成功!');
            res.redirect('/');
        });
    });


    app.get('/logout', checkLogin);
    app.get('/logout', function(req,res){
        req.session.user = null;
        req.flash('success', '登出成功！');;
        res.redirect('/');
    });


    function checkLogin(req, res, next) {
        if(!req.session.user) {
            req.flash('error', '未登录！');
            return res.redirect('/login');
        }
        next();
    }
    function checkNotLogin(req, res, next) {
        if(req.session.user) {
            req.flash('error', '已登录！');
            return res.redirect('/');
        }
        next();
    }


    app.get('/hello', function(req, res) {
        res.send('Hello World!');
    });

    app.get('/404', function(req, res) {
        res.render('404');
    });

    app.use(function(req, res) {
        return res.redirect('/404');
    });
};
