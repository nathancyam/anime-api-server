var crypto = require('crypto');

var Cache = (function() {
    var contents = {};

    var hasher = function(string) {
        return crypto.createHash('md5').update(string).digest('hex').substring(0,5);
    };

    return {
        has: function(key) {
            return contents[hasher(key)] !== undefined;
        },
        get: function(key) {
            if (this.has(key)) {
                var hashKey = hasher(key);
                return contents[hashKey];
            } else {
                console.log('No a valid cache entry');
                return null;
            }
        },
        set: function(key, value) {
            contents[hasher(key)] = value;
            return true;
        },
        flush: function() {
            contents = {};
        }
    };
})();

exports.CacheModule = Cache;