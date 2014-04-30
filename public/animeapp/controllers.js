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

ListControllers.controller('ListController', ['$scope', '$http', 'Anime',
    function ($scope, $http, Anime) {
        $scope.animeList = [];
        $scope.clickLoad = false;

        $scope.refresh = function () {
            $scope.clickLoad = !$scope.clickLoad;
            $http({ method: 'GET', url: '/anime/sync'})
                .success(function (data, status) {
                    $scope.animeList = Anime.query();
                    $scope.clickLoad = !$scope.clickLoad;
                })
                .error(function (data, status) {
                    console.log('Failed');
                    $scope.clickLoad = !$scope.clickLoad;
                });
        };

        $scope.init = function () {
            $scope.animeList = Anime.query();
        };
    }
]);
