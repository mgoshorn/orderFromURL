var test = require('unit.js');
var module = require('../Item.js');

/**
 * Test for Item construction
 */
describe('Testing Item Class', function() {
    it('Constructor Test', function() {

        //Sample data
        var order_code = 'test ID';
        var client_name = 'test User';
        var product_code = 'test product';
        var quantity = 3;
        
        test
            .given(testItem = new Item(order_code, client_name, product_code, quantity))
                .object(testItem)

                //Item object should have the given properties
                    .hasProperty('order_code')
                    .hasProperty('client_name')
                    .hasProperty('product_code')
                    .hasProperty('quantity')
                
                //With values equal to those passed to the constructor
                .string(testItem.order_code.valueOf())
                    .isEqualTo(order_code.valueOf())
                .string(testItem.client_name.valueOf())
                    .isEqualTo(client_name.valueOf())
                .string(testItem.product_code.valueOf())
                    .isEqualTo(product_code.valueOf())
                .number(testItem.quantity)
                    .isEqualTo(quantity);
    });
})

