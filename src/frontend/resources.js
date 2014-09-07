/**
 * Created with IntelliJ IDEA.
 * User: nathanyam
 * Date: 26/10/2013
 * Time: 11:33 PM
 * To change this template use File | Settings | File Templates.
 */

var animeResource = angular.module('AnimeResource', ['ngResource']);

animeResource.factory('Anime', ['$resource', function ($resource) {
    return $resource('/anime/:animeId', { animeId: '@id' }, {
        query: {
            method: 'GET',
            isArray: true
        },
        get: {
            method: 'GET',
            isArray: false
        }
    });
}]);

var animeImageResource = angular.module('AnimeImageResource', ['ngResource']);

animeImageResource.factory('AnimeImage', ['$resource', function ($resource) {
    return $resource('/anime/image/:animeId', { animeId: '@id' });
}]);

var episodeResource = angular.module('EpisodeResource', ['ngResource']);

episodeResource.factory('Episode', ['$resource', function ($resource) {
    return $resource('/episodes/anime/:animeId', { animeId: '@id' }, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
}]);

var subGroupResource = angular.module('SubgroupResource', ['ngResource']);

subGroupResource.factory('Subgroup', ['$resource', function ($resource) {
    return $resource('/subgroup/:subGroupId', { subGroupId: '@id' }, {
        query: {
            method: 'GET'
        }
    });
}]);
