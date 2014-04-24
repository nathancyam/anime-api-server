/**
 *
 * Created with IntelliJ IDEA.
 * User: nathanyam
 * Date: 26/10/2013
 * Time: 11:34 PM
 * To change this template use File | Settings | File Templates.
 */

var AnimeControllers = angular.module('AnimeControllers', []),
    ListControllers = angular.module('ListControllers', []);

AnimeControllers.controller('AnimeController', ['$scope', '$routeParams', '$http', 'Anime', 'Episode',
    function ($scope, $routeParams, $http, Anime, Episode) {
        $scope.animeId = $routeParams.animeId;
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

        $scope.init = function() {
            $scope.animeList = Anime.query();
        };
    }
]);
