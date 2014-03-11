/**
 * Created with IntelliJ IDEA.
 * User: nathanyam
 * Date: 26/10/2013
 * Time: 11:16 PM
 * To change this template use File | Settings | File Templates.
 */

exports.list = function(req, res) {
    var items = [{
        "id": 1,
        "name": "Product A",
        "description": "Another Test A",
        "price": 10,
        "categoryId": "1"
    }, {
        "id": 2,
        "name": "Product B",
        "description": "Another Test B",
        "price": 20,
        "categoryId": "2"
    }, {
        "id": 3,
        "name": "Product C",
        "description": "Another Test C",
        "price": 30,
        "categoryId": "2"
    }, {
        "id": 4,
        "name": "Product D",
        "description": "Another Test D",
        "price": 40,
        "categoryId": "3"
    }];

    // Let's simulate a AJAX request for all these items
    setTimeout(function() {
        res.json(200, items);
    }, 2000);
};
