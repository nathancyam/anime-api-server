var NotifyApp = angular.module('notifyModule', ['ngResource']);

NotifyApp.factory('NotificationResource', ['$resource', function ($resource) {
    return $resource('/notifications/:notifyId', { notifyId: '@id' });
}]);

NotifyApp.controller('NotificationController', ['$scope','NotificationResource', function ($scope, NotificationResource) {
    $scope.notifications = {};
    $scope.notifications.messages = [
        { msg: 'I am an example message' },
        { msg: 'Another example '}
    ];

    this.clearByIndex = function (index) {
        index = $scope.notifications.messages.indexOf(index);
        $scope.notifications.messages.splice(index, 1);
    };

    this.clearAll = function () {
        $scope.notifications.messages = [];
    };
}]);

NotifyApp.directive('notificationList', function () {
    return {
        restrict: 'E',
        transclude: true,
        controller: 'NotificationController',
        link: function (scope, elem, attrs) {
            elem.bind('click', function () {
//                scope.$apply(function () {
//                    scope.notifications.push({ message: 'Another example' });
//                });
            });
        },
        templateUrl: 'animeapp/views/notifications.html'
    };
});

NotifyApp.directive('notificationMsg', function () {
    return {
        require: '^notificationList',
        restrict: 'E',
        scope: {
            msg: '='
        },
        link: function (scope, elem, attrs, notificationCtrl) {
            scope.clearByIndex = function (index) {
                notificationCtrl.clearByIndex(index);
            };
            var closeIcon = angular.element(document.querySelector('.closeIcon'));
            closeIcon.css({ 'padding-left': '5px' });
        },
        template: '<p><span>{{ msg.msg }}</span><span class="closeIcon" ng-click="clearByIndex(msg)">X</span></p>'
    };
});

NotifyApp.directive('notificationClear', function () {
    return {
        require: '^notificationList',
        restrict: 'E',
        scope: {},
        link: function (scope, elem, attrs, notificationCtrl) {
            elem.css({
                cursor: 'pointer'
            });
            elem.bind('click', function () {
                notificationCtrl.clearAll();
            });
        },
        template: '<span>Clear All</span>'
    };
});
