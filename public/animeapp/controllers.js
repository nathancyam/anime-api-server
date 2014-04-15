/**
 *
 * Created with IntelliJ IDEA.
 * User: nathanyam
 * Date: 26/10/2013
 * Time: 11:34 PM
 * To change this template use File | Settings | File Templates.
 */

var AnimeControllers = angular.module('AnimeControllers', []),
    EpisodeControllers = angular.module('EpisodeControllers', []);

AnimeControllers.controller('AnimeController', ['$scope', '$http', 'Anime', 'Episode',
    function ($scope, $http, Anime, Episode) {
        $scope.animeList = [];
        $scope.selectedAnime = null;
        $scope.episodes = [];
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

        $scope.getEpisodes = function (anime) {
            $scope.selectedAnime = anime;
            Episode.query({ animeId: anime._id}, function (results) {
                $scope.episodes = results;
            });
        };

        $scope.init = function () {
            $scope.animeList = Anime.query();
        };
    }
]);

EpisodeControllers.controller('EpisodeController', ['$scope', 'Episode',
    function ($scope, Episode) {
    }
]);
