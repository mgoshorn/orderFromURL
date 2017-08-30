var test = require('unit.js');
var module = require('../Parse.js');

describe('parseLine() Test', function() {
    it('Valid argument returns Item', function() {

        var parse = new Parse();
        var valid_line = "cks12,alex-co,table,4";

        test
            .given(object = parse.parseLine(valid_line))
            .object(object)
            .hasValue("cks12")
            .hasValue("alex-co")
            .hasValue("table")
            .hasValue(4);

    });

    it('Incorrect argument number throws exception', function() {
        var parse = new Parse();
        var invalid_line = "cks12,alex-co,table,4,5";
        var error = new Error("Incorrect number of parameters");

        test
            try {
                parse.parseLine(invalid_line);
                should.fail("Method did not fail when expected");
            } catch(err) {
                
            }
    });

    it('Quantity not a number throws exception', function() {
        var parse = new Parse();
        var invalid_quantity = "cks12,alex-co,table,sun";


        test
            try {
                parse.parseLine(invalid_quantity);
                should.fail("Method should fail with invalid quantity");
            } catch(err) {
            }

    });
})