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
            }
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
            $scope.isLaoding = false;
            $scope.results = 'No Results';
            $scope.getAnime = function (name) {
                $scope.isLoading = !$scope.isLoading;
                ANN.get({ name: name }, function (results) {
                    $scope.isLoading = !$scope.isLoading;
                    $scope.results = results;
                });
            };
        },
        templateUrl: 'animeapp/views/anime-news-network.html'
    }
}]);