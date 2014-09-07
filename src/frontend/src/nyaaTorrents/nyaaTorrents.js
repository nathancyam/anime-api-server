/**
 * Created by nathanyam on 6/09/14.
 */

var NyaaTorrents = NyaaTorrents || angular.module('nyaaTorrents', []);

NyaaTorrents.factory('NyaaResource', ['$resource', function ($resource) {
    return $resource('/nyaatorrents/search');
}]);

NyaaTorrents.directive('nyaaTorrents', ['$http', 'NyaaResource', function ($http, nt) {
    return {
        scope: {
            anime: '='
        },
        controller: function ($scope) {
            $scope.torrentList = [];
            $scope.$watch('anime', function (newValue) {
                if (newValue !== undefined) {
                    nt.query({ name: newValue }, function (results) {
                        $scope.torrentList = results;
                        $scope.$broadcast('torrent-list-change');
                    });
                }
            });
        },
        templateUrl: 'animeapp/templates/nyaaTorrents/nyaatorrents.html'
    };
}]);
