var NotifyApp = angular.module('notifyModule', ['ngResource']);

NotifyApp.factory('NotificationResource', ['$resource', function ($resource) {
    return $resource('/notifications/:notifyId', { notifyId: '@id' });
}]);

NotifyApp.controller('NotificationController', ['$scope','NotificationResource', function ($scope, NotificationResource) {
    this.notifications = [{ message: 'I am an example message' }];
    $scope.messages = this.notifications;

    this.clearAll = function () {
        $scope.messages = [];
    };
}]);

NotifyApp.directive('notifications', function () {
    return {
        controller: 'NotificationController',
        transclude: true,
        scope: {},
        link: function (scope, elem, attrs) {
            elem.bind('click', function () {
                scope.$apply(function () {
                    scope.messages.push({ message: 'Another example' });
                });
            });
        },
        templateUrl: 'animeapp/views/notifications.html'
    };
});

NotifyApp.directive('notificationClear', function () {
    return {
        require: '^notifications',
        restrict: 'E',
        scope: {},
        link: function (scope, elem, attrs, notificationCtrl) {
            elem.bind('click', function () {
                notificationCtrl.clearAll();
            });
        },
        template: '<span>X<span'
    };
});
