Item = function(order_code, client_name, product_code, quantity) {
    this.order_code = order_code;
    this.client_name = client_name;
    this.product_code = product_code;
    this.quantity = quantity;
}

module.exports = Item;