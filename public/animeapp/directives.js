/**
 * Created by nathanyam on 15/04/2014.
 */

var directives = angular.module('AnimeDirectives',[]);

directives.directive('episodeList', function() {
    return {
        scope: {
            episodes: '='
        },
        controller: function($scope) {
            $scope.getSubGroup = function(fileName) {
                    return fileName.match(/\[(.*?)\]/i).pop();
            }
        },
        templateUrl: 'animeapp/views/episode-list.html'
    }
});
