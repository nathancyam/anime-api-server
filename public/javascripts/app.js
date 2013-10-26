/**
 * Created with IntelliJ IDEA.
 * User: nathan
 * Date: 10/26/13
 * Time: 5:37 PM
 * To change this template use File | Settings | File Templates.
 */

angular.module('CartExample', [])
    .controller('ItemController', function($scope, Cart) {
        $scope.filters = {};
        $scope.cart = [];
        $scope.items = [{
            "id": "1",
            "name": "Product A",
            "description": "Another Test A",
            "price": 10,
            "categoryId": "1"
        }, {
            "id": "2",
            "name": "Product B",
            "description": "Another Test B",
            "price": 20,
            "categoryId": "2"
        }, {
            "id": "3",
            "name": "Product C",
            "description": "Another Test C",
            "price": 30,
            "categoryId": "2"
        }, {
            "id": "4",
            "name": "Product D",
            "description": "Another Test D",
            "price": 40,
            "categoryId": "3"
        }];

        $scope.categories = [{
            "id": 1,
            "name": "Category 1"
        }, {
            "id": 2,
            "name": "Category 2"
        }, {
            "id": 3,
            "name": "Category 3"
        }];

        $scope.previewItem = $scope.items[0];
        $scope.addToCart = function(item) {
            var isFound = false;
            angular.forEach($scope.cart, function(elem) {
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

        $scope.calculateTotal = function() {
            var total = 0;
            angular.forEach($scope.cart, function(element) {
                total += element.price * element.quantity;
            });
            return total;
        };

        $scope.removeItem = function(index) {
            $scope.cart.splice(index, 1);
        };

        $scope.preview = function(item) {
            $scope.previewItem = item;
        };

    })

    .factory('Cart', function() {
        var cart = [];
        return {
            addItem: function(item) {
                cart.push(item);
            },

            removeItem: function(index) {
                cart.splice(index, 1);
            },

            empty: function() {
                cart = [];
            }
        }
    });
