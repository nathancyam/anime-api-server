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
    function($scope){
        $scope.bridle = {};
        $scope.activeTemplate = { active: 'config' };
    }
]);

CartControllers.controller('ProductController', ['$scope', function($scope) {
    $scope.types = [{
        "id": 1,
        "name": "Type A",
        "price" : 100
    },{
        "id": 2,
        "name": "Type 1",
        "price" : 200
    },{
        "id": 3,
        "name": "Type B",
        "price" : 400
    },{
        "id": 4,
        "name": "Type C",
        "price" : 600
    },{
        "id": 5,
        "name": "Type D",
        "price" : 1000
    }];

    $scope.productType = function(type) {
        $scope.activeTemplate.active = 'gallery';
    };
}]);

CartControllers.controller('ItemController', ['$scope', '$http', '$timeout', 'Product',
    function($scope, $http, $timeout, Product){
        $scope.filters = {};
        $scope.cart = [];
        $scope.items = Product.query();
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
            angular.forEach($scope.items, function(elem){
                if(elem.id == $scope.cart[index].id) {
                    delete elem.isSelected;
                }
            });
            $scope.cart[index].remove = true;
            $timeout(function(){
                $scope.cart.splice(index, 1);
            }, 800);
        };

        $scope.preview = function (item) {
            $scope.previewItem = item;
        };

    }]);

