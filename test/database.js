const test = require('unit.js');
var database = require('../Database.js');
var item = require('../Item.js');

/**
 * Test checks functionality  of the Database module methods
 */
describe('Database module test', function() {
    /*
    it('Connection test', async function() {
        let db;
        test
        .given(db = new Database())
        .and.given(await db.connect())
        .string(db.con.state).isNot("disconnected");
    });
    */

    it('Checking if a product is in database', function() {
        let db = new Database();

        //Products to check
        let shouldExist = "test table";
        let shouldNotExist = "test chair";

        db.connect();
        
        db.isProductInDatabase(shouldExist, function(err, result) {
            if(err) throw err;
            
            //This product should exist in the database
            test.bool(result).isTrue();  
        });

        db.isProductInDatabase(shouldNotExist, function(err, result) {
            if(err) throw err;
            
            //This product should not exist in the database
            test.bool(result).isFalse();
        });
    });

    //Test determines whether insertion is working correctly
    it('Product Insertion Test', function(done) {
        let db = new Database();
        db.connect();
        db.beginTransaction();

        //Itm should not currently be present
        let toBeAdded = 'test_table';

        //Adds product to database
        db.addProductToDatabase(toBeAdded, function(err, result) {
            
            //Throw error if there is any SQL error
            if(err) throw err;
            
            //Rollback transaction
            db.rollback();
            done();
        })
    })

    //Test determines whether transaction rollbacks are working properly
    it('Transaction Rollback Test', function(done) {
        let db = new Database();

        //Test order
        let order = new item('test_code', 'test_client', 'test_product', 5);
        
        db.connect();
        db.beginTransaction();

        //Determine if order is already in database - it should not be currently
        db.isOrderInDatabase(order, function(err, result) {
            if(err) throw err;

            //Testing order should initially not be in database
            test.bool(result).isFalse();

            //Insert order into database
            db.insert(order, function(err, result) {
                if(err) throw err;
            
                //rollback database
                db.rollback();
                
                //Order should still not be in the database
                db.isOrderInDatabase(order, function(err, result) {
                    if(err) throw err;
                    test.bool(result).isFalse();
                    done();
                });
            });
        });
    });
})