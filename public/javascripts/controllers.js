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
        };

        $scope.checkout = function () {
            $http({
                method: 'POST',
                url: 'http://localhost:3000/checkout',
                data: $scope.cart,
                headers: {'Content-Type': 'application/json'}
            }).success(function () {
                    $scope.success = 'Checkout Successful';
                }).error(function () {
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

