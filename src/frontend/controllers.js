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


AnimeControllers.controller('AnimeController', ['$scope', '$routeParams', '$http', 'Anime', 'Episode',
    function ($scope, $routeParams, $http, Anime, Episode) {
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

ListControllers.controller('ListController', ['$scope', '$http', '$location', 'Anime',
    function ($scope, $http, $location, Anime) {
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

        $scope.init = function () {
            $scope.torrentList = [];
            $scope.getWatchingTorrents();
        };
    }
]);
