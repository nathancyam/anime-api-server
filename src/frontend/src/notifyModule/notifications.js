var NotifyApp = angular.module('notifyModule', ['ngResource']);

NotifyApp.factory('NotificationResource', ['$resource', function ($resource) {
    return $resource('/notifications/:notifyId', { notifyId: '@id' });
}]);

NotifyApp.factory('NotificationHandler', ['NotificationResource', '$rootScope', 'Socket',
    function (notifyResource, $rootScope, Socket) {
        $rootScope.notifications = $rootScope.notifications || [];

        $rootScope.$watchCollection('notifications', function (newVal, oldVal) {
            $rootScope.notifications = newVal;
        });

        /**
         * Listen to the event
         */
        Socket.on('notify:new', function (notify) {
            $rootScope.notifications.push(notify);
            $rootScope.$broadcast('notifications:add', { newNotify: notify, all: $rootScope.notifications });
        });

        return {
            clearAll: function () {
                $rootScope.notifications = [];
                Socket.emit('notifications:clear', {});
            },
            addNotification: function (notify) {
                $rootScope.notifications.push(notify);
                $rootScope.$digest();
            },
            getCount: function () {
                return $rootScope.notifications.length;
            },
            clearByIndex: function (index) {
                index = $rootScope.notifications.indexOf(index);
                $rootScope.notifications.splice(index, 1);
            },
            getNotifications: function () {
                return $rootScope.notifications;
            }
        };
    }
]);

NotifyApp.controller('NotificationController', ['$scope', 'NotificationHandler',
    function ($scope, NotifyHandler) {
        /**
         * Clears the notification by a specified index
         *
         * @param index
         */
        this.clearByIndex = function (index) {
            NotifyHandler.clearByIndex(index);
        };

        /**
         * Clears all the notifications
         */
        this.clearAll = function () {
            NotifyHandler.clearAll();
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
        templateUrl: 'animeapp/templates/notifyModule/notifications.html'
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

NotifyApp.directive('notificationCounter', function () {
    return {
        restrict: 'E',
        template: '<span id="notification-counter" class="badge" ng-show="notifications.length > 0">{{ notifications.length }}</span>'
    };
});
