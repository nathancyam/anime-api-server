/**
 * Created by nathanyam on 6/09/14.
 *
 * Contains all the information and logic that allows us to query AnimeNewsNetwork
 */

var ANN = ANN || angular.module('animeNewsNetwork', ['ngResource']);

ANN.factory('AnnAPI', ['$resource', function ($resource) {
    return $resource('/ann/search');
}]);

ANN.factory('AnnParser', [function () {
    return {
        parseResult: function (result) {
            return {
                title: result.title,
                image: result.images[0],
                genres: result.genres,
                description: result.plot_summary
            };
        }
    };
}]);

ANN.directive('animeNewsNetwork', ['AnnAPI', '$http', '$location',
    function (ANN, $http, $location) {
        return {
            scope: {
                anime: '='
            },
            controller: function ($scope) {
                $scope.isLoading = false;
                $scope.results = 'No Results';

                /**
                 * When the anime object changes, adjust accordingly.
                 */
                $scope.$watch('anime', function (newValue) {
                    if (newValue !== undefined) {
                        $scope.isLoading = true;
                        var queryObj = { name: newValue.title };
                        if (newValue.ann_id !== undefined) {
                            queryObj.ann_id = newValue.ann_id;
                        }
                        ANN.get(queryObj, function (results) {
                            $scope.isLoading = false;
                            $scope.results = results;
                            setImage();
                        });
                    }
                });

                /**
                 * Sets the image URL for the anime object
                 * @returns {*}
                 */
                $scope.getImageUrl = function () {
                    if ($scope.results.images) {
                        return $scope.results.images[0];
                    }
                };

                /**
                 * Set the image URL to the server
                 */
                var setImage = function () {
                    var animeId = $location.path().split('/').pop();
                    var postUrl = '/anime/image/' + animeId;
                    $http.post(postUrl, { animeId: animeId, imageUrl: $scope.results.images[0] })
                        .success(function (data) {
                            console.log(data);
                        }
                    );
                };
            },
            templateUrl: 'animeapp/templates/animeNewsNetwork/anime-news-network.html'
        };
    }
]);
