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

directives.directive('animeNewsNetwork', ['AnimeNewsNetwork', function (ANN) {
    return {
        scope: {
            anime: '='
        },
        controller: function ($scope) {
            $scope.isLoading = false;
            $scope.results = 'No Results';

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
                    });
                }
            });
        },
        templateUrl: 'animeapp/views/anime-news-network.html'
    };
}]);

directives.directive('nyaaTorrents', ['$http', 'NyaaTorrents', function ($http, nt) {
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
        templateUrl: 'animeapp/views/nyaatorrents.html'
    };
}]);

directives.directive('torrentListing', ['$http', function ($http) {
    return {
        controller: function ($scope) {
            $scope.start = 0;
            $scope.finish = 10;
            $scope.currentPage = 1;

            $scope.addToTorrentClient = function (torrent) {
                torrent.status = 'adding';
                $http.post('/torrent/add', {
                    torrentUrl: torrent.href
                }).success(function () {
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
                $http.post('/torrent/add', { torrentUrl: list })
                    .success(function () {
                        $scope.message = "Successfully added " + list.length + " torrents";
                    })
                    .error(function (data) {
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
        templateUrl: 'animeapp/views/torrents.html'
    };
}]);

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

directives.directive('notificationArea', ['Socket', function (socket) {
    return {
        controller: function ($scope) {
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
                $scope.title = data.title;
                $scope.message = data.message;
            };

            $scope.$on('destroy', function (event) {
                socket.removeAllListeners();
            });
        },
        templateUrl: 'animeapp/views/notification.html'
    };
}]);
