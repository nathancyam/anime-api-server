/**
 * Created with IntelliJ IDEA.
 * User: nathan
 * Date: 10/26/13
 * Time: 5:58 PM
 * To change this template use File | Settings | File Templates.
 */

var cart = [];

exports.index = function(req, res){
    res.send(JSON.stringify(cart));
};

exports.checkout = function(req, res){
    // Use timeout to simulate AJAX request and callback the 200
    setTimeout(addToCart(req.body, function(){
        res.json(200, { msg : 'OK'});
    }), 5000);
};

exports.add = function(req, res) {
    var isFound = false;
    for(item in res)
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

function addToCart(item, cb) {
    cart.push(item);
    cb();
}
