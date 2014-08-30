var NotifyApp = angular.module('notifyModule', ['ngResource']);

NotifyApp.factory('NotificationResource', ['$resource', function ($resource) {
    return $resource('/notifications/:notifyId', { notifyId: '@id' });
}]);

NotifyApp.controller('NotificationController', ['$scope', 'Socket',
    function ($scope, Socket) {
        var self = this;

        $scope.notifications = {
            messages: [],
            counter: 0
        };

        /**
         * Listen to the event
         */
        Socket.on('notify:new', function (notify) {
            console.log(notify.type);
            console.log(notify.message);
            self.addNotification(notify);
        });

        /**
         * Clears the notification by a specified index
         *
         * @param index
         */
        this.clearByIndex = function (index) {
            index = $scope.notifications.messages.indexOf(index);
            $scope.notifications.messages.splice(index, 1);
        };

        /**
         * Clears all the notifications
         */
        this.clearAll = function () {
            $scope.notifications.messages = [];
            Socket.emit('notifications:clear', {});
        };

        /**
         * Update the notification counter
         */
        this.updateCounter = function () {
            $scope.notifications.counter = $scope.notifications.messages.length;
        };

        /**
         * Adds the notification to the notification collection
         *
         * @param notify
         */
        this.addNotification = function (notify) {
            $scope.notifications.messages.push(notify);
            this.updateCounter();
        };
    }
]);

NotifyApp.directive('notificationList', ['NotificationResource', function (NotifyResource) {
    return {
        restrict: 'E',
        transclude: true,
        controller: 'NotificationController',
        link: function (scope, elem, attrs) {
            scope.checkNotifications = function () {
                NotifyResource.query(function (result) {
                    console.log(result);
                    scope.notifications.messages = result;
                });
            };
        },
        templateUrl: 'animeapp/views/notifications.html'
    };
}]);

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
