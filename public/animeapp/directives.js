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
    }
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
    }
}]);

directives.directive('nyaaTorrents', ['$http', 'NyaaTorrents', function ($http, nt) {
    return {
        scope: {
            anime: '='
        },
        controller: function ($scope) {
            $scope.torrentList = [];

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

            $scope.$watch('anime', function (newValue) {
                socket.emit('client_torrent', { loli: 'Chiaka' });
                if (newValue !== undefined) {
                    nt.query({ name: newValue }, function (results) {
                        // TODO: Add an icon to indicate the torrent is on the torrent server
                        // Add the isLoading property initially
                        $scope.torrentList = results.map(function (e) {
                            e.status = 'static';
                            return e;
                        });
                    });
                }
            });
        },
        templateUrl: 'animeapp/views/torrents.html'
    }
}]);

directives.directive('animeOptions', [ 'Anime', function (Anime) {
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
            }
        },
        templateUrl: 'animeapp/views/anime-options.html'
    }
}]);

directives.directive('backImg', function () {
    return function (scope, element, attrs) {
        var url = attrs.backImg;
        element.css({
            'background-image': 'url(' + url + ')'
        });
    }
});
