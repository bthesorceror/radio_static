var tape        = require('tape');
var RadioStatic = require('./index');

var NopStream = function () {
  this.readable = true;
  this.writable = true;
};

require('util').inherits(NopStream, require('stream'));

NopStream.prototype.write = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  this.emit.apply(this, ['data'].concat(args))
};

NopStream.prototype.end = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  this.emit.apply(this, ['end'].concat(args))
};

(function() {
  tape('data is passed between streams', function(test) {
    test.plan(2);

    var radio   = new RadioStatic();
    var stream1 = new NopStream();
    var stream2 = new NopStream();
    var stream3 = new NopStream();

    radio.assimilate(stream1);
    radio.assimilate(stream2);
    radio.assimilate(stream3);

    stream1.write = function(data) {
      test.equal(data, 'something');
    };

    stream3.write = function(data) {
      test.equal(data, 'something');
    };

    stream2.write = function(data) {
      test.equal(data, 'something');
    };

    stream2.emit('data', 'something');
  });

  tape('data is passed between streams', function(test) {
    test.plan(3);

    var radio   = new RadioStatic();
    var stream1 = new NopStream();
    var stream2 = new NopStream();
    var stream3 = new NopStream();

    radio.assimilate(stream1);
    radio.assimilate(stream2);
    radio.assimilate(stream3);

    stream1.write = function(data) {
      test.equal(data, 'something');
    };

    stream2.write = function(data) {
      test.equal(data, 'something');
    };

    stream3.write = function(data) {
      test.equal(data, 'something');
    };

    radio.write('something');
  });

  tape("streams are removed on 'end' event", function(test) { 
    test.plan(3);

    var radio   = new RadioStatic();
    var stream1 = new NopStream();
    var stream2 = new NopStream();
    var stream3 = new NopStream();

    radio.assimilate(stream1);
    radio.assimilate(stream2);
    radio.assimilate(stream3);

    stream1.write = function(data) {
      test.equal(data, 'something');
    };

    stream2.write = function(data) {
      test.equal(data, 'something');
    };

    radio.on('streamRemoved', function(stream) {
      test.equal(stream, stream3);
      stream3.write('something');
    });

    stream3.end('something');
  });

  tape("ending radio ends streams", function(test) { 
    test.plan(2);

    var radio   = new RadioStatic();
    var stream1 = new NopStream();
    var stream2 = new NopStream();

    radio.assimilate(stream1);
    radio.assimilate(stream2);

    stream1.end = function(data) {
      test.ok(true);
    };

    stream2.end = function(data) {
      test.ok(true);
    };

    radio.end();
  });
})();
