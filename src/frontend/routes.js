/**
 * Created by nathanyam on 24/04/2014.
 */

var routes = angular.module('AppRoutes', ['ngRoute']);

routes.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/list', {
            templateUrl: 'animeapp/views/list.html',
            controller: 'ListController'
        }).
        when('/anime/add', {
            templateUrl: 'animeapp/views/add-anime.html',
            controller: 'AddController'
        }).
        when('/anime/:animeId', {
            templateUrl: 'animeapp/views/anime.html',
            controller: 'AnimeController'
        }).
        when('/settings', {
            templateUrl: 'animeapp/views/settings.html',
            controller: 'SettingsController'
        }).
        when('/torrents', {
            templateUrl: 'animeapp/views/torrents-overview.html',
            controller: 'TorrentController'
        }).
        otherwise({
            redirectTo: '/list'
        });
}]);

