/**
 * Created with IntelliJ IDEA.
 * User: nathanyam
 * Date: 26/10/2013
 * Time: 11:33 PM
 * To change this template use File | Settings | File Templates.
 */

var productResource = angular.module('ProductResource', ['ngResource']);

productResource.factory('Product', ['$resource',
    function ($resource) {
        return $resource('products', {}, {
            query: {
                method: 'GET',
                isArray: true
            }
        });
    }
]);

var animeResource = angular.module('AnimeResource', ['ngResource']);

animeResource.factory('Anime', ['$resource', function ($resource) {
    return $resource('/anime', {}, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
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
