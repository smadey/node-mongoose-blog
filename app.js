
var http = require('http'),
    fs = require('fs');

var express = require('express'),
    MongoStore = require('connect-mongo')(express),
    flash = require('connect-flash');

var routes = require('./routes'),
    settings = require('./settings');

var accessLog = fs.createWriteStream(__dirname + '/log/access.log', { flags: 'a' });
var errorLog = fs.createWriteStream(__dirname + '/log/error.log', { flags: 'a' });

var app = express();

app.engine('.html', require('ejs').__express);

// all environments
app.set('port', settings.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(flash());
app.use(express.favicon());
app.use(express.logger({ stream: accessLog }));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + '/public/images' }));
app.use(express.methodOverride());
app.use(express.cookieParser());

if(settings.db.host == 'localhost') {
    app.use(express.session({
        secret: settings.cookieSecret,
        key: settings.db.db,
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },//30 days
        store: new MongoStore(settings.db)
    }));
}
else {
    app.use(express.session({ secret: settings.cookieSecret }));
}

app.use(app.router);

app.use(express.static(__dirname + '/public'));

app.use(function (err, req, res, next) {
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
});

// development only
app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// production only
app.configure('production', function(){
    app.set('view cache', true);
    app.use(express.errorHandler());
});

routes(app);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});