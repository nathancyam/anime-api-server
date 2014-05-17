/**
 * Created with IntelliJ IDEA.
 * User: nathan
 * Date: 10/26/13
 * Time: 5:37 PM
 * To change this template use File | Settings | File Templates.
 */


var setting = [
    'ui.bootstrap'
];

var controllers = [
    'ListControllers',
    'AnimeControllers',
    'SettingsControllers',
];

var resources = [
    'AnimeResource',
    'EpisodeResource',
    'SubgroupResource',
    'AnnResource',
    'NyaaResource'
];

var directives = [
    'AnimeDirectives'
];

var routes = [
    'AppRoutes'
];

var dependencies = [].concat(setting, controllers, resources, directives, routes);

angular.module('AnimeApp', dependencies);

