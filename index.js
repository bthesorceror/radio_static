function RadioStatic() {
  this._streams = {};
  this.key = 0;
}

(require('util')).inherits(RadioStatic, (require('events')).EventEmitter);

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
  }.bind(this)

  stream.on('end', end);

  this._addStream(key, stream, data, end);

  return key;
}

RadioStatic.prototype._broadcast = function(data, end, from) {
  if (from)
    this.emit('data', data);

  Object.keys(this._streams).forEach(function(key) {
    var stream = this._streams[key][2];
    if (key != from) {
      end ? stream.end(data) : stream.write(data);
    }
  }.bind(this));
}

RadioStatic.prototype._addStream = function(key, stream, dataListener, endListener) {
  this._streams[key] = [dataListener, endListener, stream];
}

RadioStatic.prototype._removeStream = function(key) {
  if (this._streams[key]) {
    var stream = this._streams[key][2];
    stream.removeListener('data', this._streams[key][0]);
    stream.removeListener('end', this._streams[key][1]);
    delete this._streams[key];
    this.emit('streamRemoved', stream);
  }
}

module.exports = RadioStatic;
