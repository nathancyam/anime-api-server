/**
 * Created by nathanyam on 6/09/14.
 */

var toastNotify = toastNotify || angular.module('toastNotify', []);

toastNotify.directive('toastNotifications', ['$timeout', 'Socket', function ($timeout, socket) {
    return {
        scope: {},
        controller: function ($scope) {
            $scope.hide = true;

            /**
             * Assumes the notification data is in this format:
             * {
             *      title: String,
             *      message: String
             * }
             */
            socket.on('notification:error', function (data) {
                $scope.status = 'error';
                setMessage(data);
            });
            socket.on('notification:notice', function (data) {
                $scope.status = 'notice';
                setMessage(data);
            });
            socket.on('notification:success', function (data) {
                $scope.status = 'success';
                setMessage(data);
            });

            var setMessage = function (data) {
                $scope.hide = !$scope.hide;
                $scope.title = data.title;
                $scope.message = data.message;

                $timeout(function () {
                    $scope.hide = true;
                }, 3000);
            };

            $scope.$on('destroy', function (event) {
                socket.removeAllListeners();
            });

            $scope.remove = function () {
                $scope.title = undefined;
                $scope.message = undefined;
            };
        },
        templateUrl: 'animeapp/templates/toastNotify/toastNotifications.html'
    };
}]);

