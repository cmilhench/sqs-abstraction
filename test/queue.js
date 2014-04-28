// -----------------------------------------------------------------
//  TESTS
//  
//  sqs-abstraction
//  Copyright 2014. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 


// -----------------------------------------------------------------
//  Dependencies

var assert    = require('assert'),
    Queue     = require('../');
    
// -----------------------------------------------------------------
//  Private members

var config = {
  name: process.env.QUEUE_NAME || 'dev-queue',
  interval: process.env.QUEUE_INTERVAL || 1000 * 60 * 10
  config: {
    "accessKeyId": "ACCESSKEY", 
    "secretAccessKey": "SECRETKEY", 
    "region": "REGION"
  }
}
    
// -----------------------------------------------------------------
//  Tests

describe('Queue', function() {
  
  var test = function(done) {
    var json = { verb:'experienced', user:'colin', object:'nodejs' };
    var queue = new Queue(config);
    queue.on('data', function(msg){
      assert(msg, 'should have recieved a message');
      assert(msg.body.verb === json.verb, 'should have recieved json');
      queue.delete(msg, done);
    });
    queue.write(json, function(err) {
      if (err)  { return done(err); }
    });
    queue.read();
  }
    
  describe('in Development', function() {
    var original = process.env.NODE_ENV;
    before(function(){ process.env.NODE_ENV = undefined; });
    it('should read, write and delete messages', test);
    after(function(){ process.env.NODE_ENV = original; });
  });
  
  describe.skip('in Production', function() {
    var original = process.env.NODE_ENV;
    before(function(){ process.env.NODE_ENV = 'production'; });
    it('should read, write and delete messages', test);
    after(function(){ process.env.NODE_ENV = original; });
  });
  
});