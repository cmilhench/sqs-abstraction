// -----------------------------------------------------------------
//  queue-sqs.js
//  
//  sqs-abstraction
//  Copyright 2014. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

var events  = require('events'),
    util    = require('util'),
    aws     = require('aws-sdk');
    
// -----------------------------------------------------------------
//  Helper methods

var Message = function(meta, body) {
  if (!(this instanceof Message)) { 
    return new Message(meta, body);
  }
  this.meta = meta || {};
  this.body = body || '';
  try {
    this.body = JSON.parse(this.body);
  } catch (e) { }
};

// -----------------------------------------------------------------
//  API methods

/* 
 * @event #data @type {Message}
 * @event #error @type {Error}
 *
 * @callback doneCallback
 * @param {err} responseCode
 * @param {data} responseMessage
 */
var Queue = function(options) {
  if (!(this instanceof Queue)) {
    return new Queue(options);
  }
  var self = this;
  this.sqs = new aws.SQS(options.config);
  this.queueName = options.name;
  this.queuePoll = options.interval;
  this.getQueueUrl = function(done) {
    // Store the queueUrl the first time we ask
    // for it so that we can be more efficient.
    if (self.queueUrl) return process.nextTick(function(){ done(null, self.queueUrl); }); 
    self.sqs.getQueueUrl({ QueueName: self.queueName }, function(err, data) {
      if (err) { return done(err); }
      self.queueUrl = data.QueueUrl;
      return done(err, data.QueueUrl);
    });
  };
  events.EventEmitter.call(this);
};

util.inherits(Queue, events.EventEmitter);


/**
 * Read from the queue using aws long-polling (at 20 seconds).
 *  - If no messages are returned repeat after {int} seconds.
 *  - Maximum wait time is {int} seconds when queue is empty.
 *  - with the queue being checked once every {int}+20 seconds.
 *
 * @api public
 */
Queue.prototype.read = function() {
  var self = this;
  var interval = parseInt(arguments[0], 10) || self.queuePoll;
  this.getQueueUrl(function(err, data) {
    if(err) { return self.emit('error', err); }
    var options = { 
      QueueUrl: data, 
      AttributeNames: ['ALL'], 
      MaxNumberOfMessages: 10, 
      WaitTimeSeconds: 20 
    };
    self.sqs.receiveMessage(options, function(err, data) {
      if(err) { return self.emit('error', err); }
      for(var i = 0; i < ((data.Messages||{}).length||0); i++) {
        self.emit('data', new Message(data.Messages[i], data.Messages[i].Body));
      }
      if (interval < 1) {
        return;
      }
      self.timeout = setTimeout(function(){ 
        self.timeout = 0;
        self.read(); 
      }, interval);
    });
  });
};


/**
 * Write a message to the queue
 *
 * @param {(String|Object)} message
 * @callback doneCallback
 * @api public
 */
Queue.prototype.write = function(msg, done) {
  var self = this;
  this.getQueueUrl(function(err, data) {
    if(err) { return done(err); }
    var options = {
      QueueUrl: data,
      MessageBody: typeof msg === 'string' ? msg : JSON.stringify(msg)
    };
    self.sqs.sendMessage(options, done);
  });
};

/**
 * Delete a message from the queue
 *
 * @param {Message} message
 * @callback doneCallback
 * @api public
 */
Queue.prototype.delete = function(msg, done) {
  var self = this;
  this.getQueueUrl(function(err, data) {
    if(err) { return done(err); }
    var options = { 
      QueueUrl: data, 
      ReceiptHandle: msg.meta.ReceiptHandle 
    };
    self.sqs.deleteMessage(options, function(err, data){
      if(err) { return done(err); }
      done(err, data);
    });
  });
};


// -----------------------------------------------------------------
//  Exports

module.exports = Queue;