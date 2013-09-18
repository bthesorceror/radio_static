var Readable = require('stream').Readable;

function RadioStatic() {
  Readable.apply(this);
  this._streams = {};
  this.key = 0;
}

(require('util')).inherits(RadioStatic, Readable);

function StreamHandler(stream, listeners) {
  this.stream = stream;
  this.listeners = listeners;
}

StreamHandler.prototype.remove = function() {
  Object.keys(this.listeners).forEach(function(key) {
    this.stream.removeListener(key, this.listeners[key]);
  }.bind(this));
}

RadioStatic.prototype.write = function(data) {
  this._broadcast(data);
}

RadioStatic.prototype.end = function(data) {
  this._broadcast(data, true);
  process.nextTick(function() {
    this.emit('end', data);
  }.bind(this));
}

RadioStatic.prototype.nextKey = function() {
  return (++this.key);
}

RadioStatic.prototype.assimilate = function(stream) {

  var key = this.nextKey();

  var data = function(data) {
    this._broadcast(data, false, key);
  }.bind(this);

  stream.on('data', data);

  var end = function(data) {
    if (data)
      this._broadcast(data, false, key);
    this._removeStream(key);
  }.bind(this);
  stream.on('end', end);

  var error = function(err) {
    this.emit('error', err);
    this._removeStream(key);
  }.bind(this);

  stream.on('error', error);

  var handler = new StreamHandler(stream, {
    end: end,
    error: error,
    data: data
  });

  this._addStream(key, handler);

  return key;
}

RadioStatic.prototype._broadcast = function(data, end, from) {
  from && this.push(data);

  Object.keys(this._streams).forEach(function(key) {
    var stream = this._streams[key].stream;
    if (key != from) {
      end ? stream.end(data) : stream.write(data);
    }
  }.bind(this));
}

RadioStatic.prototype._addStream = function(key, handler) {
  this._streams[key] = handler;
}

RadioStatic.prototype._read = function() { }

RadioStatic.prototype._removeStream = function(key) {
  if (this._streams[key]) {
    var handler = this._streams[key];
    handler.remove();
    delete this._streams[key];
    this.emit('streamRemoved', handler.stream);
  }
}

module.exports = RadioStatic;
