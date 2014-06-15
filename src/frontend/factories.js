/**
 * Created by nathan on 5/24/14.
 */


var torrentFactory = angular.module('TorrentFactory', []);

torrentFactory.factory('Torrents', ['$http', '$q', function ($http, $q) {
    return {
        getWatchingAnimeTorrents: function () {
            var deferred = $q.defer();
            $http.get('/anime/update')
                .success(function (result) {
                    deferred.resolve(result);
                })
                .error(function (result) {
                    deferred.reject(result);
                });
            return deferred.promise;
        },
        pushWatchingAnimeTorrents: function () {
            var deferred = $q.defer();
            $http.get('/anime/update?push=true')
                .success(function (result) {
                    deferred.resolve(result);
                })
                .error(function (result) {
                    deferred.reject(result);
                });
            return deferred.promise;
        },
        setNewConfig: function (data) {
            var deferred = $q.defer();

            $http.post('/anime/update', data)
                .success(function (res) {
                    deferred.resolve(res);
                });
            return deferred.promise;
        }
    };
}]);

var socketFactory = angular.module('SocketFactory', []);

socketFactory.factory('Socket', ['$rootScope', function ($rootScope) {
    var socket = io();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}]);
