// -----------------------------------------------------------------
//  queue-fs.js
//  
//  sqs-abstraction
//  Copyright 2014. Colin Milhench. All rights reserved.
//  
//  Colin Milhench
// 

var events   = require('events'),
    util     = require('util'),
    fs       = require('fs'),
    path     = require('path');
    
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
  this.directory = path.join('/tmp', (options||{}).name || 'queue-fs');
  events.EventEmitter.call(this);
};

util.inherits(Queue, events.EventEmitter);


/**
 * Read from the queue
 *
 * @api public
 */
Queue.prototype.read = function() {
  var self = this;
  var interval = process.env.QUEUE_INTERVAL || 1000 * 40;
  var files = fs.readdirSync(this.directory);
  files = files.filter(function() {
    return /\d{3}\.json$/.test(arguments[0]);
  });
  if (!files.length) {
    self.timeout = setTimeout(function(){ 
      self.timeout = 0;
      self.read(); 
    }, interval);
    return;
  }
  var file = path.join(this.directory, files[0]);
  fs.readFile(file, function (err, data) {
    if (err) { return self.emit('error', err); }
    fs.renameSync(file, file + '.if');
    self.emit('data', new Message(files[0], data));
    self.read();
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
  var name = util.format('%s.json', +new Date());
  var file = path.join(this.directory, name);
  var data = JSON.stringify(msg);
  if (!fs.existsSync(this.directory)) {
    fs.mkdirSync(this.directory);
  }
  fs.writeFile(file, data, done);
};

/**
 * Delete a message from the queue
 *
 * @param {Message} message
 * @callback doneCallback
 * @api public
 */
Queue.prototype.delete = function(msg, done) {
  var file = path.join(this.directory, msg.meta + '.if');
  fs.unlink(file, done);
};


// -----------------------------------------------------------------
//  Exports

module.exports = Queue;