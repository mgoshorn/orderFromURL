var fs          = require('fs');
var request     = require('request');
var stream      = require('stream');
var eventStream = require('event-stream');
var item        = require('./Item.js');
var database    = require('./Database.js');

Parse = function() {
    
    //Output trackers
    this.lineCount = 0;
    this.ordersAdded = 0;
    this.outstanding = new Set();
    /**
     * Primary stream/processing loop.
     * 
     * This method accepts a URL and handles the processing and inserting of data
     * into a database. Method uses a stream and a DB transaction for the purpose of
     * maintaining DB integrity - The database transaction will be rolled back upon
     * encountering errors, allowing us to be sure that the data has not been partially
     * inserted.
     * 
     * @param url - URL from which data is to be streamd from
     */
    this.parse = function(url) {
        
        //Setup database and begin transaction
        db = new Database();
        db.connect();
        db.beginTransaction();

        //Connect to URL and begin stream
        var stream = request(url)
        .pipe(eventStream.split())

        //Process stream by line
        .pipe(eventStream.mapSync((function(line){
            
            //Pause stream while processing data
            stream.pause();

            //Increment counter
            this.lineCount++;

            //Process the line and pass data to the database
            this.processStreamLine(line, db);
            
            //Start stream again
            stream.resume();

        }).bind(this))

        //On stream error
        .on('error', function(err) {
            //Handle stream error
            db.rollback();
            console.log('Stream error on stream line:  ' + this.lineCount);
            console.error('Operation aborted');
            throw(err);
        })

        //On stream end
        .on('end', function() {
            //Handle end of stream
            this.streamComplete = true;
            Promise.all(this.outstanding).then( values => {
                db.commit();
                console.log();
                console.log('Complete!');
                process.exit();
            })
        }.bind(this)));
    }

    /**
     * Method accepts a line of content, splits it at the ',', then returns an Item object
     * or throws error when the line does not conform to standard formatting
     * 
     * line format:
     * order_code,client_name,product_code,quantity
     * 
     * @param line - A single line from the stream conforming to standard line format:
     * @return Item object from line data
     */
    this.parseLine = function(line) {

        //Split line at commas to form an array
        var arr = line.split(',');
        
        //A valid order should produce an array of 4 indices
        if(arr.length != 4) {
            throw new Error('\nIncorrect number of parameters');
        }

        //Quantity must be an integer value
        if(isNaN(arr[3])) {
            throw new Error('\nQuantity must be an integer value: ' + line);
        }

        //Instantiate new item from array indices
        var item = new Item(arr[0], arr[1], arr[2], +arr[3]);

        //Other data may not be empty strings
        var orderHasEmptyData = (item.order_code == "" || item.product_code == ""
                || item.client_name == "");
        if(orderHasEmptyData) {
            throw new Error('\nOrder missing required data!')
        }

        return item;
    }

    /**
     * Accepts a line of data, processes, then adds data to the DB
     * if quantity is greater than 0.
     * 
     * Throws error upon database error.
     * 
     * @param line String line passed from data stream
     * @param db db connection
     */
    this.processStreamLine = function(line, db) {
        //Adding order to database TRY block
        try {
            //Get order object by parsing line
            var order = this.parseLine(line);

            //Do not insert orders whose quantities are 0 or less
            if(order.quantity > 1) {
                this.ordersAdded++;

                //Insert order into database
                let insertionPromise = new Promise((resolve, reject) => {
                    db.insert(order, function(err, result) {
                        if(err) {
                            throw err;
                            reject();
                        }
                        this.outstanding.delete(insertionPromise);
                        resolve(0);
                    }.bind(this))
                });
                this.outstanding.add(insertionPromise);
            }

        } catch(err) {
            //Handle insert error
            console.error('\nLine parse error on stream line: ' + this.lineCount + ': ' + err);
            
            //Rollback database 
            db.rollback();
            console.error('\nOperation aborted');
            throw(err);
        }

        //General process output
        process.stdout.write('\rStreaming data into DB. Lines processed: ' + this.lineCount
            + ', orders added to database: ' + this.ordersAdded );
    }
}

module.exports = Parse;