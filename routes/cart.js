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

exports.add = function(req, res){
    // Use timeout to simulate AJAX request and callback the 200
    setTimeout(addToCart(req.body.item, function(){
        res.json(200, { msg : 'OK'});}
    ), 5000);
};

function addToCart(item, cb) {
    cart.push(item);
    cb();
}
