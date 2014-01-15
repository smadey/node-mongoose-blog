
var settings = {
    cookieSecret: 'blog',
    port: 18080,
    db: {
        url: __dirname.indexOf('bae-') > -1 ? 'mongodb://sa:sa@localhost:27017/blog' :
            'mongodb://IvX4khZ4jePvD1yjdh3C38AE:FslYUIUuLcEO9RfXu7gGlUeqEFRLvkr9@mongo.duapp.com:8908/MSgSCBggYnrdoWqllJlf'
    }
};

// if(__dirname.indexOf('bae-') > -1) {
//     settings.db = {
//         db: 'blog',
//         host: 'localhost',
//         port: require('mongodb').Connection.DEFAULT_PORT,
//         username: 'sa',
//         password: 'sa',
//     }
// }
// else {
//     settings.db = {
//         db: 'MSgSCBggYnrdoWqllJlf',
//         host: 'mongo.duapp.com',
//         port: 8908,
//         username: 'IvX4khZ4jePvD1yjdh3C38AE',
//         password: 'FslYUIUuLcEO9RfXu7gGlUeqEFRLvkr9'
//     }
// }

module.exports = settings;