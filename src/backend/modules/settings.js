/*jslint node: true*/
"use strict";

var Settings = module.exports = (function () {
    var settings = {};

    return {
        init: function (obj) {
            settings = obj;
        },
        has: function (key) {
            return settings[key] !== undefined;
        },
        get: function (key) {
            if (this.has(key)) {
                return settings[key];
            } else {
                return null;
            }
        },
        set: function (key, value) {
            settings[key] = value;
            return true;
        },
        all: function () {
            return settings;
        }
    };
})();
