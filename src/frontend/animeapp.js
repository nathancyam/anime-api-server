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
    'animeNewsNetwork',
    'notifyModule',
    'nyaaTorrents',
    'toastNotify',
    'torrentList'
];

var controllers = [
    'ViewControllers',
];

var resources = [
    'AnimeResource',
    'AnimeImageResource',
    'EpisodeResource',
    'SubgroupResource',
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

