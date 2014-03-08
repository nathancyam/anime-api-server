/**
 * Created with IntelliJ IDEA.
 * User: nathan
 * Date: 10/31/13
 * Time: 7:34 PM
 * To change this template use File | Settings | File Templates.
 */

var CartDirectives = angular.module('CartDirectives', []);

CartDirectives.directive('testDirective', function(){
    return {
        scope: {
            test: '=test'
        },
        template: '{{ test }}'
    };
});
