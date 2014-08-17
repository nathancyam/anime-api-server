var NotifyApp = angular.module('notifyModule', ['ngResource']);

NotifyApp.factory('NotificationResource', ['$resource', function ($resource) {
    return $resource('/notifications/:notifyId', { notifyId: '@id' });
}]);

NotifyApp.controller('NotificationController', ['$scope','NotificationResource', function ($scope, NotificationResource) {
    this.notifications = [{ message: 'I am an example message' }];
    $scope.messages = this.notifications;
}]);

NotifyApp.directive('notifications', function () {
    return {
        controller: 'NotificationController',
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
