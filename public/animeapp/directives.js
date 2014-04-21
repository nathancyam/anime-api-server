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
            $scope.isLoading = false;
            $scope.results = 'No Results';

            $scope.$watch('anime', function (newValue) {
                $scope.isLoading = true;
                ANN.get({ name: newValue }, function (results) {
                    $scope.isLoading = false;
                    $scope.results = results;
                });
            });
        },
        templateUrl: 'animeapp/views/anime-news-network.html'
    }
}]);