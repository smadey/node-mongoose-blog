var crypto = require('crypto');

// format date, eg: formatDate(Date.now(), 'yyyy-MM-dd HH:mm')
exports.formatDate = function(date, format) {
    if(typeof date != 'object') {
        date = new Date(date);
    }
    format = format || 'yyyy-MM-dd HH:mm:ss';

    var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours() % 12 == 0 ? 12 : date.getHours() % 12,
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        'S': date.getMilliseconds()
    };
    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1,  RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        }
    }
    return format;
}

// md5 content
exports.md5 = function(content) {
    return crypto.createHash('md5').update(content).digest('hex');
};

// get avatar by user's email
exports.getAvatarByEmail = function(email) {
    email = (email || '').toLowerCase();
    return 'http://www.gravatar.com/avatar/' + exports.md5(email) + '?s=48';
}

// get client ip address
exports.getClientIP = function(request) {
    var ipAddress;
    var forwardedIpsStr = request.header('x-forwarded-for');
    if (forwardedIpsStr) {
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        ipAddress = request.connection.remoteAddress;
    }
    return ipAddress;
};