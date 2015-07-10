/**
 * Created by nathanyam on 6/09/14.
 *
 * Contains all the information and logic that allows us to query AnimeNewsNetwork
 */

var ANN = ANN || angular.module('animeNewsNetwork', ['ngResource']);

ANN.factory('AnnAPI', ['$resource', function ($resource) {
    return $resource('/ann/search');
}]);

ANN.directive('animeNewsNetwork', ['AnnAPI', '$http', '$location',
    function (ANN, $http, $location) {
        return {
            scope: {
                anime: '='
            },
            controller: function ($scope) {
                $scope.isLoading = false;
                $scope.results = 'No Results';

                /**
                 * When the anime object changes, adjust accordingly.
                 */
                $scope.$watch('anime', function (newValue) {
                    if (newValue !== undefined) {
                        $scope.isLoading = true;
                        var queryObj = { name: newValue.title };
                        if (newValue.ann_id !== undefined) {
                            queryObj.ann_id = newValue.ann_id;
                        }
                        ANN.get(queryObj, function (results) {
                            $scope.isLoading = false;
                            $scope.results = results;
                            setImage();
                        });
                    }
                });

                /**
                 * Sets the image URL for the anime object
                 * @returns {*}
                 */
                $scope.getImageUrl = function () {
                    if ($scope.results.images) {
                        return $scope.results.images[0];
                    }
                };

                /**
                 * Set the image URL to the server
                 */
                var setImage = function () {
                    var animeId = $location.path().split('/').pop();
                    var postUrl = '/anime/image/' + animeId;
                    $http.post(postUrl, { animeId: animeId, imageUrl: $scope.results.images[0] })
                        .success(function (data) {
                            console.log(data);
                        }
                    );
                };
            },
            templateUrl: 'animeapp/templates/animeNewsNetwork/anime-news-network.html'
        };
    }
]);

var NotifyApp = angular.module('notifyModule', ['ngResource']);

NotifyApp.factory('NotificationResource', ['$resource', function ($resource) {
    return $resource('/notifications/:notifyId', { notifyId: '@id' });
}]);

NotifyApp.factory('NotificationHandler', ['NotificationResource', '$rootScope', 'Socket',
    function (notifyResource, $rootScope, Socket) {
        $rootScope.notifications = $rootScope.notifications || [];

        $rootScope.$watchCollection('notifications', function (newVal, oldVal) {
            $rootScope.notifications = newVal;
        });

        /**
         * Listen to the event
         */
        Socket.on('notify:new', function (notify) {
            $rootScope.notifications.push(notify);
            $rootScope.$broadcast('notifications:add', { newNotify: notify, all: $rootScope.notifications });
        });

        return {
            clearAll: function () {
                $rootScope.notifications = [];
                Socket.emit('notifications:clear', {});
            },
            addNotification: function (notify) {
                $rootScope.notifications.push(notify);
                $rootScope.$digest();
            },
            getCount: function () {
                return $rootScope.notifications.length;
            },
            clearByIndex: function (index) {
                index = $rootScope.notifications.indexOf(index);
                $rootScope.notifications.splice(index, 1);
            },
            getNotifications: function () {
                return $rootScope.notifications;
            }
        };
    }
]);

NotifyApp.controller('NotificationController', ['$scope', 'NotificationHandler',
    function ($scope, NotifyHandler) {
        /**
         * Clears the notification by a specified index
         *
         * @param index
         */
        this.clearByIndex = function (index) {
            NotifyHandler.clearByIndex(index);
        };

        /**
         * Clears all the notifications
         */
        this.clearAll = function () {
            NotifyHandler.clearAll();
        };
    }
]);

NotifyApp.directive('notificationList', ['NotificationResource', function (NotifyResource) {
    return {
        restrict: 'E',
        transclude: true,
        controller: 'NotificationController',
        link: function (scope, elem, attrs) {
            scope.checkNotifications = function () {
                NotifyResource.query(function (result) {
                    console.log(result);
                    scope.notifications.messages = result;
                });
            };
        },
        templateUrl: 'animeapp/templates/notifyModule/notifications.html'
    };
}]);

NotifyApp.directive('notificationMsg', function () {
    return {
        require: '^notificationList',
        restrict: 'E',
        scope: {
            msg: '='
        },
        link: function (scope, elem, attrs, notificationCtrl) {
            scope.clearByIndex = function (index) {
                notificationCtrl.clearByIndex(index);
            };
            var closeIcon = angular.element(document.querySelector('.closeIcon'));
            closeIcon.css({ 'padding-left': '5px' });
        },
        template: '<p><span>{{ msg.msg }}</span><span class="closeIcon" ng-click="clearByIndex(msg)">X</span></p>'
    };
});

NotifyApp.directive('notificationClear', function () {
    return {
        require: '^notificationList',
        restrict: 'E',
        scope: {},
        link: function (scope, elem, attrs, notificationCtrl) {
            elem.css({
                cursor: 'pointer'
            });
            elem.bind('click', function () {
                notificationCtrl.clearAll();
            });
        },
        template: '<span>Clear All</span>'
    };
});

NotifyApp.directive('notificationCounter', function () {
    return {
        restrict: 'E',
        template: '<span id="notification-counter" class="badge" ng-show="notifications.length > 0">{{ notifications.length }}</span>'
    };
});

/**
 * Created by nathanyam on 6/09/14.
 */

var NyaaTorrents = NyaaTorrents || angular.module('nyaaTorrents', []);

NyaaTorrents.factory('NyaaResource', ['$resource', function ($resource) {
    return $resource('/nyaatorrents/search');
}]);

NyaaTorrents.directive('nyaaTorrents', ['$http', 'NyaaResource', function ($http, nt) {
    return {
        scope: {
            anime: '='
        },
        controller: function ($scope) {
            $scope.torrentList = [];
            $scope.$watch('anime', function (newValue) {
                if (newValue !== undefined) {
                    nt.query({ name: newValue }, function (results) {
                        $scope.torrentList = results;
                        $scope.$broadcast('torrent-list-change');
                    });
                }
            });
        },
        templateUrl: 'animeapp/templates/nyaaTorrents/nyaatorrents.html'
    };
}]);

/**
 * Created by nathanyam on 6/09/14.
 */

var toastNotify = toastNotify || angular.module('toastNotify', []);

toastNotify.directive('toastNotifications', ['$timeout', 'Socket', function ($timeout, socket) {
    return {
        scope: {},
        controller: function ($scope) {
            $scope.hide = true;

            /**
             * Assumes the notification data is in this format:
             * {
             *      title: String,
             *      message: String
             * }
             */
            socket.on('notification:error', function (data) {
                $scope.status = 'error';
                setMessage(data);
            });
            socket.on('notification:notice', function (data) {
                $scope.status = 'notice';
                setMessage(data);
            });
            socket.on('notification:success', function (data) {
                $scope.status = 'success';
                setMessage(data);
            });

            var setMessage = function (data) {
                $scope.hide = !$scope.hide;
                $scope.title = data.title;
                $scope.message = data.message;

                $timeout(function () {
                    $scope.hide = true;
                }, 3000);
            };

            $scope.$on('destroy', function (event) {
                socket.removeAllListeners();
            });

            $scope.remove = function () {
                $scope.title = undefined;
                $scope.message = undefined;
            };
        },
        templateUrl: 'animeapp/templates/toastNotify/toastNotifications.html'
    };
}]);


/**
 * Created by nathanyam on 6/09/14.
 */


var torrentList = torrentList || angular.module('torrentList', []);

torrentList.factory('TorrentAPI', ['$http',
    function ($http) {
        var torrentUri = '/torrent/add';

        return {
            add: function (torrents) {
                if (torrents.torrentUrl) {
                    return $http.post(torrentUri, torrents);
                } else {
                    console.err('You need to define the torrentUrl property, which is either an URL or array of URLs');
                }
            }
        };
    }
]);

torrentList.directive('torrentListing', ['TorrentAPI', function (TorrentAPI) {
    return {
        controller: function ($scope) {
            $scope.start = 0;
            $scope.finish = 10;
            $scope.currentPage = 1;

            $scope.addToTorrentClient = function (torrent) {
                torrent.status = 'adding';
                var request = TorrentAPI.add({ torrentUrl: torrent.href });

                request.success(function () {
                    torrent.status = 'added';
                    $scope.message = "Successfully added!";
                }).error(function (err) {
                    torrent.status = 'error';
                    console.log(err);
                });
            };

            $scope.addMultipleTorrents = function () {
                var list = $scope.torrentList.filter(function (item) {
                    return item.isSelected !== undefined && item.isSelected;
                })
                    .reduce(function (prev, curr) {
                        prev.push(curr.href);
                        return prev;
                    }, []);

                var request = TorrentAPI.add({ torrentUrl: list });
                request.success(function () {
                    $scope.message = "Successfully added " + list.length + " torrents";
                }).error(function (data) {
                    console.log(data);
                });
            };

            $scope.pageChanged = function () {
                var start = 0,
                    finish = 10;

                if ($scope.currentPage !== 1) {
                    start = ($scope.currentPage * 10);
                    finish = start + 10;
                }

                $scope.start = start;
                $scope.finish = finish;
            };

            $scope.$on('torrent-list-change', function (newValue) {
                if (newValue !== undefined) {
                    $scope.torrentList = newValue.targetScope.torrentList;
                }
            });

            $scope.showRow = function (index) {
                return index >= $scope.start && index < $scope.finish;
            };
        },
        templateUrl: 'animeapp/templates/torrentList/torrents.html'
    };
}]);


/**
 * Created with IntelliJ IDEA.
 * User: nathan
 * Date: 10/26/13
 * Time: 5:37 PM
 * To change this template use File | Settings | File Templates.
 */


var setting = [
    'ui.bootstrap',
    'ngAnimate',
    'ngCookies',
    'animeNewsNetwork',
    'notifyModule',
    'nyaaTorrents',
    'toastNotify',
    'torrentList'
];

var controllers = [
    'ListControllers',
    'AnimeControllers',
    'SettingsControllers',
    'TorrentControllers'
];

var resources = [
    'AnimeResource',
    'AnimeImageResource',
    'EpisodeResource',
    'SubgroupResource',
];

var factories = [
    'TorrentFactory',
    'SocketFactory'
];

var directives = [
    'AnimeDirectives'
];

var routes = [
    'AppRoutes'
];

var dependencies = [].concat(setting, controllers, resources, factories, directives, routes);

angular.module('AnimeApp', dependencies);


/**
 *
 * Created with IntelliJ IDEA.
 * User: nathanyam
 * Date: 26/10/2013
 * Time: 11:34 PM
 * To change this template use File | Settings | File Templates.
 */

var AnimeControllers = angular.module('AnimeControllers', []),
    ListControllers = angular.module('ListControllers', []),
    TorrentControllers = angular.module('TorrentControllers', []),
    SettingControllers = angular.module('SettingsControllers', []);


AnimeControllers.controller('AnimeController', ['$scope', '$routeParams', '$cookieStore', 'Anime', 'Episode',
    function ($scope, $routeParams, $cookieStore, Anime, Episode) {
        $scope.closeOthers = false;
        $cookieStore.remove('currentAnime');
        $cookieStore.put('currentAnime', $routeParams.animeId);

        Anime.get({ animeId: $routeParams.animeId }, function (result) {
            $scope.anime = result;
            Episode.query({ animeId: result._id }, function (result) {
                $scope.episodes = result;
            });
        });
    }
]);

SettingControllers.controller('SettingsController', ['$scope', '$http',
    function ($scope, $http) {
        $http.get('/settings')
            .success(function (data) {
                $scope.settings = data;
            })
            .error(function (data) {
                console.log(data);
            });
        $scope.submitForm = function () {
            $http.post('/settings', $scope.settings)
                .success(function (data, status) {

                })
                .error(function () {
                    console.log('Failed');
                });
        };
    }
]);

ListControllers.controller('ListController', ['$scope', '$http', '$location', 'Anime', 'AnimeImage',
    function ($scope, $http, $location, Anime, AnimeImage) {
        $scope.animeList = [];
        $scope.isProcessing = false;

        $scope.refresh = function () {
            $scope.isProcessing = !$scope.isProcessing;
            $http({ method: 'GET', url: '/sync/anime'})
                .success(function () {
                    $scope.animeList = Anime.query();
                    $scope.isProcessing = !$scope.isProcessing;
                })
                .error(function () {
                    console.log('Failed');
                    $scope.isProcessing = !$scope.isProcessing;
                });
        };

        $scope.changeView = function (anime) {
            var path = "/anime/" + anime._id;
            $location.path(path);
        };

        $scope.init = function () {
            $scope.animeList = [];
            $scope.animeList = Anime.query();
        };
    }
]);

TorrentControllers.controller('TorrentController', ['$scope', 'Torrents',
    function ($scope, TorrentFactory) {
        $scope.torrentList = [];

        $scope.getWatchingTorrents = function () {
            TorrentFactory.getWatchingAnimeTorrents()
                .then(function (result) {
                    if (Array.isArray(result)) {
                        $scope.torrentList = result;
                    }
                }
            );
        };

        $scope.submit = function () {
            TorrentFactory.setNewConfig($scope.torrentConfig)
                .then(function () {
                    console.log('Added successfully');
                });
        };

        $scope.init = function () {
            $scope.torrentList = [];
            $scope.getWatchingTorrents();
        };
    }
]);

/**
 * Created by nathanyam on 15/04/2014.
 */

var directives = angular.module('AnimeDirectives', []);

directives.directive('episodeList', function () {
    return {
        scope: {
            episodes: '='
        },
        controller: function ($scope) {
            $scope.getSubGroup = function (fileName) {
                return fileName.match(/\[(.*?)\]/i).pop();
            };
        },
        templateUrl: 'animeapp/views/episode-list.html'
    };
});

directives.directive('animeOptions', ['Anime', function (Anime) {
    return {
        scope: {
            anime: '='
        },
        controller: function ($scope) {
            $scope.save = function () {
                var anime = Anime.get({ animeId: $scope.anime._id }, function () {
                    anime.designated_subgroup = $scope.anime.designated_subgroup;
                    anime.$save();
                });
            };
            $scope.changeWatchStatus = function () {
                $scope.anime.is_watching = !$scope.anime.is_watching;
                var anime = Anime.get({ animeId: $scope.anime._id }, function () {
                    anime.is_watching = $scope.anime.is_watching;
                    anime.$save();
                });
            };
            $scope.changeCompleteStatus = function () {
                $scope.anime.is_complete = !$scope.anime.is_complete;
                var anime = Anime.get({ animeId: $scope.anime._id }, function () {
                    anime.is_complete = $scope.anime.is_complete;
                    anime.$save();
                });
            };
        },
        templateUrl: 'animeapp/views/anime-options.html'
    };
}]);

directives.directive('backImg', function () {
    return function (scope, element, attrs) {
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url + ')'
        });
    };
});


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

/**
 * Created with IntelliJ IDEA.
 * User: nathanyam
 * Date: 26/10/2013
 * Time: 11:33 PM
 * To change this template use File | Settings | File Templates.
 */

var animeResource = angular.module('AnimeResource', ['ngResource']);

animeResource.factory('Anime', ['$resource', function ($resource) {
    return $resource('/anime/:animeId', { animeId: '@id' }, {
        query: {
            method: 'GET',
            isArray: true
        },
        get: {
            method: 'GET',
            isArray: false
        }
    });
}]);

var animeImageResource = angular.module('AnimeImageResource', ['ngResource']);

animeImageResource.factory('AnimeImage', ['$resource', function ($resource) {
    return $resource('/anime/image/:animeId', { animeId: '@id' });
}]);

var episodeResource = angular.module('EpisodeResource', ['ngResource']);

episodeResource.factory('Episode', ['$resource', function ($resource) {
    return $resource('/episodes/anime/:animeId', { animeId: '@id' }, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
}]);

var subGroupResource = angular.module('SubgroupResource', ['ngResource']);

subGroupResource.factory('Subgroup', ['$resource', function ($resource) {
    return $resource('/subgroup/:subGroupId', { subGroupId: '@id' }, {
        query: {
            method: 'GET'
        }
    });
}]);

/**
 * Created by nathanyam on 24/04/2014.
 */

var routes = angular.module('AppRoutes', ['ngRoute']);

routes.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/list', {
            templateUrl: 'animeapp/views/list.html',
            controller: 'ListController'
        }).
        when('/anime/:animeId', {
            templateUrl: 'animeapp/views/anime.html',
            controller: 'AnimeController'
        }).
        when('/settings', {
            templateUrl: 'animeapp/views/settings.html',
            controller: 'SettingsController'
        }).
        when('/torrents', {
            templateUrl: 'animeapp/views/torrents-overview.html',
            controller: 'TorrentController'
        }).
        otherwise({
            redirectTo: '/list'
        });
}]);


/**
 * Created by nathan on 5/10/14.
 */

var socket = io();

socket.on('news', function (data) {
    console.log(data);
    socket.emit('other_event', { my: 'Data' });
});

socket.on('torrent_add_success', function (data) {
    console.log(data);
});

socket.on('torrent_add_error', function (data) {
    console.log(data);
});
