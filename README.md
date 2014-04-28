sqs-abstraction
==========

**sqs-abstraction** is a node module for abstracting development against amazon's
simple queue service, by simply employing a stratergy, to swap out the 
production (sqs) implementation with a file system implementation dependent on 
the presence of the `NODE_ENV === 'production'` environment variable.

It uses long polling at a configurable interval in order to monitor the queue 
in definately.

## Installation

    $ npm install sqs-abstraction

## Examples

Configuration

```
var config = {
  name: 'QUEUE NAME',
  interval: 1000 * 60 * 10, // MONITOR INTERVAL in milliseconds (default 10min)
  config: {
    // Your AWS SQS configuration
  }
}
```

Initialisation

```
var Queue = require('sqs-abstraction');
var queue = new Queue(config);
```

Check the queue for messages one time only;

```
queue.read(-1);
```

Monitor the queue for messages each `config.interval`

```
queue.read();
```

Handle incoming messages

```
queue.on('data', function(msg){
  // ...
});
```

Write messages to the queue.

```
queue.write(json, function(err) {
  // ...
});
```

## License 

(The MIT License)

Copyright (c) 2013 Colin Milhench <colin@milhen.ch>;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.