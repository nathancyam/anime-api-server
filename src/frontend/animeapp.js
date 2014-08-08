/**
 * Created with IntelliJ IDEA.
 * User: nathan
 * Date: 10/26/13
 * Time: 5:37 PM
 * To change this template use File | Settings | File Templates.
 */


var setting = [
    'ui.bootstrap',
    'ngAnimate',
    'ngCookies',
    'notifyModule'
];

var controllers = [
    'ListControllers',
    'AnimeControllers',
    'SettingsControllers',
    'TorrentControllers'
];

var resources = [
    'AnimeResource',
    'AnimeImageResource',
    'EpisodeResource',
    'SubgroupResource',
    'AnnResource',
    'NyaaResource'
];

var factories = [
    'TorrentFactory',
    'SocketFactory'
];

var directives = [
    'AnimeDirectives'
];

var routes = [
    'AppRoutes'
];

var dependencies = [].concat(setting, controllers, resources, factories, directives, routes);

angular.module('AnimeApp', dependencies);

