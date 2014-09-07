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

