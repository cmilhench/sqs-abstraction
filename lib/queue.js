// -----------------------------------------------------------------
//  index.js
//  
//  sqs-abstraction
//  Copyright 2014. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 
// This defines the base `implementation` for the queue class proxying
// messages into the implementation using a 'stratergy' to chose the 
// best for the given scenario. i.e. development vs. production.


// -----------------------------------------------------------------
//  Dependencies

var events    = require('events'),
    util      = require('util'),
    FileQueue = require('./queue-fs'),
    ProdQueue = require('./queue-sqs');


// -----------------------------------------------------------------
//  API methods

function Queue(options) {
  if (!(this instanceof Queue)) {
    return new Queue(options);
  }
  if (process.env.NODE_ENV === 'production') {
    this.queue = new ProdQueue(options);
  } else {
    this.queue = new FileQueue(options);
  }
  this.queue.on('data', this.emit.bind(this, 'data'));
  this.queue.on('error', this.emit.bind(this, 'error'));
  events.EventEmitter.call(this);
}

util.inherits(Queue, events.EventEmitter);

Queue.prototype.read = function() {
  if (!this.queue.read) {
    throw new Error('not implemented');
  }
  this.queue.read();
};

Queue.prototype.write = function(message, done) {
  if (!this.queue.write) {
    throw new Error('not implemented');
  }
  this.queue.write(message, done);
};

Queue.prototype.delete = function(message, done) {
  if (!this.queue.delete) {
    throw new Error('not implemented');
  }
  this.queue.delete(message, done);
};

// -----------------------------------------------------------------
//  Exports

module.exports = Queue;