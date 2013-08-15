function RadioStatic() { 
  this._streams = [];
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

RadioStatic.prototype.assimilate = function(stream) {
  this._addStream(stream);

  stream.on('data', function(data) {
    this.emit('data', data);
    this._broadcast(data, false, stream);
  }.bind(this));

  stream.on('end', function(data) {
    if (data)
      this._broadcast(data, false, stream);
    this._removeStream(stream);
  }.bind(this));
}

RadioStatic.prototype._broadcast = function(data, end, from) {
  this._streams.forEach(function(stream) {
    if (stream !== from) {
      end ? stream.end(data) : stream.write(data);
    }
  });
}

RadioStatic.prototype._addStream = function(stream) {
  this._streams.push(stream);
}

RadioStatic.prototype._removeStream = function(stream) {
  var index = this._streams.indexOf(stream);
  if (index > 0) {
    this._streams.splice(index, 1);
    this.emit('streamRemoved', stream);
  }
}

module.exports = RadioStatic;
