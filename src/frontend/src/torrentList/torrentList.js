/**
 * Created by nathanyam on 6/09/14.
 */


var torrentList = torrentList || angular.module('torrentList', []);

torrentList.factory('TorrentAPI', ['$http',
    function ($http) {
        var torrentUri = '/torrent/add';

        return {
            add: function (torrents) {
                if (torrents.torrentUrl) {
                    return $http.post(torrentUri, torrents);
                } else {
                    console.err('You need to define the torrentUrl property, which is either an URL or array of URLs');
                }
            }
        };
    }
]);

torrentList.directive('torrentListing', ['TorrentAPI', function (TorrentAPI) {
    return {
        controller: function ($scope) {
            $scope.start = 0;
            $scope.finish = 10;
            $scope.currentPage = 1;

            $scope.addToTorrentClient = function (torrent) {
                torrent.status = 'adding';
                var request = TorrentAPI.add({ torrentUrl: torrent.href });

                request.success(function () {
                    torrent.status = 'added';
                    $scope.message = "Successfully added!";
                }).error(function (err) {
                    torrent.status = 'error';
                    console.log(err);
                });
            };

            $scope.addMultipleTorrents = function () {
                var list = $scope.torrentList.filter(function (item) {
                    return item.isSelected !== undefined && item.isSelected;
                })
                    .reduce(function (prev, curr) {
                        prev.push(curr.href);
                        return prev;
                    }, []);

                var request = TorrentAPI.add({ torrentUrl: list });
                request.success(function () {
                    $scope.message = "Successfully added " + list.length + " torrents";
                }).error(function (data) {
                    console.log(data);
                });
            };

            $scope.pageChanged = function () {
                var start = 0,
                    finish = 10;

                if ($scope.currentPage !== 1) {
                    start = ($scope.currentPage * 10);
                    finish = start + 10;
                }

                $scope.start = start;
                $scope.finish = finish;
            };

            $scope.$on('torrent-list-change', function (newValue) {
                if (newValue !== undefined) {
                    $scope.torrentList = newValue.targetScope.torrentList;
                }
            });

            $scope.showRow = function (index) {
                return index >= $scope.start && index < $scope.finish;
            };
        },
        templateUrl: 'animeapp/templates/torrentList/torrents.html'
    };
}]);

