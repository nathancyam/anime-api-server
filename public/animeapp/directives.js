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
        },
        templateUrl: 'animeapp/views/episode-list.html'
    }
});
