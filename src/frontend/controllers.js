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
            $scope.animeList = Anime.query(function (data) {
                $scope.getImages();
            });
        };

        $scope.getImages = function () {
            angular.forEach($scope.animeList, function (anime) {
                anime.imageSrc = AnimeImage.get({ animeId: anime._id });
            });
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
