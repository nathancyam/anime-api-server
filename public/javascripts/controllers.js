/**
 *
 * Created with IntelliJ IDEA.
 * User: nathanyam
 * Date: 26/10/2013
 * Time: 11:34 PM
 * To change this template use File | Settings | File Templates.
 */

var CartControllers = angular.module('CartControllers', []);

CartControllers.controller('ItemController', ['$scope', '$http', 'Product',
    function($scope, $http, Product){
        $scope.filters = {};
        $scope.cart = [];
        $scope.items = Product.query();
        $scope.spinner = true;

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

        $scope.anyFilters = function(){
            var size = 0, key;
            for (key in $scope.filters) {
                if ($scope.filters.hasOwnProperty(key)) size++;
            }
            return size > 0;
        };

        $scope.previewItem = $scope.items[0];
        $scope.addToCart = function (item) {
            var isFound = false;
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
            }).success(function(data){
                    $scope.success = 'Added "' + item.name + '" to cart!';
                }).
                error(function(data){
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
            $scope.cart.splice(index, 1);
        };

        $scope.preview = function (item) {
            $scope.previewItem = item;
        };

    }]);

