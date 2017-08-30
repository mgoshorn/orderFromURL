var mysql = require('mysql');

Database = function() {

    this.con;

    /**
     * Create MYSQL connection
     * ***Replace with own server connection data
     */
    this.connect = function() {
        this.con = mysql.createConnection({
            host: '127.0.0.1',
            user: 'testing_tester',
            password: 'qkrwltndPQj',
            database: 'testing'
        });
    }

    /**
     * Begins database transaction
     */
    this.beginTransaction = function() {
        this.con.beginTransaction(function(err) {
            if (err) throw err;
        })
    }

    /**
     * Method used as predicate for the existence of a
     * given product_code in the product table
     * 
     * @param product_code
     * @param callback
     * @return predicate result
     */
    this.isProductInDatabase = function(product_code, callback) {
        let productInDatabaseQuery = 'SELECT product_code FROM product WHERE product_code = ?'; 
        this.con.query(productInDatabaseQuery, [product_code],
                    function(err, results) {
            if(err) callback(err, null);
            else {
                let productExists = results.length > 0;
                callback(null, productExists);
            }
        });
    }

    /**
     * Method used as predicate for the existence of a
     * given order_code in database. This method is used
     * in unit testing.
     * 
     * @param order order_code
     * @param callback
     * @return predicate result
     */
    this.isOrderInDatabase = function(order, callback) {
        let isOrderQuery = 'SELECT product_code FROM `order` WHERE order_code = ?';
        this.con.query(isOrderQuery, [order.order_code], function(err, results) {
            
            if(err) callback(err, null);
            else {
                let orderExists = results.length > 0;
                callback(null, orderExists);
            }
        });
    }


    /**
     * Inserts a given product_code into the product table.
     * 
     * @param product_code to be inserted
     * @param callback
     */
    this.addProductToDatabase = function(product_code, callback) {
        let addProductQuery = 'INSERT INTO product (product_code) VALUES (?);';
        this.con.query(addProductQuery, [product_code],
                        function(error, results) {

            if(error) callback(error, null);
            callback(null, results);
        })
    }

    /**
     * Inserts an order into a database
     * 
     * @param item Item object holding order data
     * @param callback
     */
    this.insert = function(item, callback) {
        
        let query = 'INSERT INTO `order` (order_code, client_name, product_code, quantity) VALUES (?, ?, ?, ?);'

        //Check if product_code is in the product table, if not add it in callback
        if(!this.isProductInDatabase(item.product_code, function(err, inDatabase) {
            (() => this);
            if(err) throw err;

            //Add product_code to product table if it doesn't exist already
            if(!inDatabase) {
                this.addProductToDatabase(item.product_code, function(err, result) {
                    if(err) throw err;
                });
            }
        }.bind(this)));

        //Insert order into database
        this.con.query(query, [item.order_code, item.client_name, item.product_code, item.quantity],
        function(error, results, field) {
             if(error) callback(error, null);
             callback(null, results);      
        });
    }

    /**
     * Rollback transaction
     * Called upon error
     */
    this.rollback = function(callback) {
        this.con.rollback();
    }

    /**
     * Commit changes to database.
     * Once called changes can not be rolled back.
     */
    this.commit = function() {
        this.con.commit(function(err) {
            
            if(err) {
                this.rollback();
                throw err;
            }
        })
    }

}