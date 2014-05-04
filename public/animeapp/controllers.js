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
            .success(function (data, status) {
                $scope.settings = data;
            })
            .error(function (data, status) {
                console.log(data);
            });
        $scope.submitForm = function () {
            $http.post('/settings', $scope.settings)
                .success(function (data, status) {

                })
                .error(function (data, status) {
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
                .success(function (data, status) {
                    $scope.animeList = Anime.query();
                    $scope.isProcessing = !$scope.isProcessing;
                })
                .error(function (data, status) {
                    console.log('Failed');
                    $scope.isProcessing = !$scope.isProcessing;
                });
        };

        $scope.changeView = function(anime) {
            var path = "/anime/" + anime._id;
            $location.path(path);
        };

        $scope.init = function () {
            $scope.animeList = [];
            $scope.animeList = Anime.query();
        };
    }
]);
