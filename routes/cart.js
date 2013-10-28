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
    setTimeout(function(){
        addToCart(req.body);
        cart = [];
        res.json(200, { status: 'OK' });
    }, 5000);
};

exports.add = function(req, res) {
    var newItem = req.body;
    var hasItem = false;

    // Go through the cart and check if the item already exists. If so, then increase the quantity in the cart
    for(var i = 0; i < cart.length; i++){
        if(cart[i].id === newItem.id) {
            cart[i].quantity += 1;
            hasItem = true;
            break;
        }
    }
    if(!hasItem) {
        cart.push(newItem);
    }
    res.json(200, { status: 'Product added' });
};

exports.remove = function(req, res) {
    var removeId = parseInt(req.params.id);
    var index = checkExistingItemId(removeId);
    if(index !== false) {
        cart.splice(index,1);
        res.json(200, { status: 'Removed' });
    } else {
        res.json(200, { status: 'Item not in cart' });
    }
};

function checkExistingItemId(itemId){
    for(var i = 0; i < cart.length; i++) {
        if(cart[i].id === itemId){
            return i;
        }
    }
    return false;
}

function addToCart(item, cb) {
    cart.push(item);
}
