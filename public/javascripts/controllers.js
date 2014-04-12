/**
 *
 * Created with IntelliJ IDEA.
 * User: nathanyam
 * Date: 26/10/2013
 * Time: 11:34 PM
 * To change this template use File | Settings | File Templates.
 */

var CartControllers = angular.module('CartControllers', []);

CartControllers.controller('BridleController', ['$scope',
    function ($scope) {
        $scope.bridle = {};
        $scope.activeTemplate = { active: 'config' };
        $scope.hasChosenType = { chosenType: false };
    }
]);

CartControllers.controller('ProductController', ['$scope', function ($scope) {
    $scope.types = [
        {
            "id": 1,
            "name": "Type A",
            "price": 100
        },
        {
            "id": 2,
            "name": "Type 1",
            "price": 200
        },
        {
            "id": 3,
            "name": "Type B",
            "price": 400
        },
        {
            "id": 4,
            "name": "Type C",
            "price": 600
        },
        {
            "id": 5,
            "name": "Type D",
            "price": 1000
        }
    ];

    $scope.productType = function () {
        $scope.activeTemplate.active = 'gallery';
        $scope.hasChosenType.chosenType = true;
    };
}]);

CartControllers.controller('ItemController', ['$scope', '$http', '$timeout', 'Product',
    function ($scope, $http, $timeout, Product) {
        $scope.filters = {};
        $scope.cart = [];
        $scope.items = Product.query();
        $scope.spinner = true;
        $scope.previewItem = $scope.items[0];

        $scope.categories = [
            {
                "id": 1,
                "name": "Category 1"
            },
            {
                "id": 2,
                "name": "Category 2"
            },
            {
                "id": 3,
                "name": "Category 3"
            }
        ];

        $scope.resetFilters = function () {
            $scope.filters = {};
        };

        $scope.anyFilters = function () {
            var size = 0, key;
            for (key in $scope.filters) {
                if ($scope.filters.hasOwnProperty(key)) size++;
            }
            return size > 0;
        };

        $scope.isActive = function (category) {
            var isSelected = false;
            angular.forEach($scope.filters, function (e, k) {
                if (!isSelected) {
                    if (k === 'categoryId' && category.id === e) {
                        isSelected = true;
                    }
                }
            });
            return isSelected;
        };

        $scope.previewItem = $scope.items[0];

        $scope.addToCart = function (item) {
            var isFound = false;
            item.isSelected = true;

            // Add this item's category and selection to the JS object
            $scope.bridle[item.categoryId] = item.id;
            angular.forEach($scope.cart, function (elem) {
                if (!isFound) {
                    if (elem.id === item.id) {
                        elem.quantity += 1;
                        isFound = true;
                    }
                }
            });
            if (!isFound) {
                item.quantity = 1;
                $scope.cart.push(item);
            }
            $http({
                method: 'POST',
                url: 'http://localhost:3000/cart/add',
                data: item,
                headers: {'Content-Type': 'application/json'}
            }).success(function () {
                $scope.success = 'Added "' + item.name + '" to cart!';
            }).
                error(function () {
                    $scope.error = 'Failed to add to cart';
                });
        };

        $scope.checkout = function () {
            $scope.spinner = false;
            $http({
                method: 'POST',
                url: 'http://localhost:3000/checkout',
                data: $scope.cart,
                headers: {'Content-Type': 'application/json'}
            }).success(function () {
                $scope.spinner = true;
                $scope.success = 'Checkout Successful';
                $scope.cart = [];
                deselectAll();
            }).error(function () {
                $scope.spinner = true;
                $scope.error = "Checkout Failed!";
            });
        };

        $scope.calculateTotal = function () {
            var total = 0;
            angular.forEach($scope.cart, function (element) {
                total += element.price * element.quantity;
            });
            return total;
        };

        $scope.removeItem = function (index) {
            $http({
                method: 'DELETE',
                url: 'http://localhost:3000/cart/' + $scope.cart[index].id
            }).success(function (data) {
            });
            $scope.cart[index].remove = true;
            $timeout(function () {
                $scope.cart.splice(index, 1);
            }, 800);
        };

        $scope.preview = function (item) {
            $scope.previewItem = item;
        };

        function deselectAll() {
            angular.forEach($scope.items, function (e) {
                e.isSelected = false;
            });
        }

    }]);

var AnimeControllers = angular.module('AnimeControllers', []),
    EpisodeControllers = angular.module('EpisodeControllers', []);

AnimeControllers.controller('AnimeController', ['$scope', 'Anime', 'Episode',
    function ($scope, Anime, Episode) {
        $scope.anime = [];
        $scope.selectedAnime = null;
        $scope.episodes = [];

        $scope.getAnime = function () {
            $scope.anime = Anime.query();
        };

        $scope.getEpisodes = function (anime) {
            $scope.selectedAnime = anime;
            Episode.query({ animeId: anime._id}, function (results) {
                $scope.episodes = results;
            });
        };

        $scope.init = function () {
            $scope.anime = Anime.query();
        };

        $scope.isSelected = function (anime) {
            return anime._id === $scope.selectedAnime._id;
        };
    }
]);

EpisodeControllers.controller('EpisodeController', ['$scope', 'Episode',
    function ($scope, Episode) {
    }
]);
