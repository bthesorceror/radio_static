# Radio Static

[![Build Status](https://travis-ci.org/bthesorceror/radio_static.png?branch=master)](https://travis-ci.org/bthesorceror/radio_static)

## Usage

### Creating a new instance

```javascript
var RadioStatic = require('radio_static');

var radio = new RadioStatic();
```

### Adding a new stream to the collective

```javascript
var stream = new Stream();

radio.assimilate(stream);
```

Any data read from this stream will be written to all of the other
assimilated streams (not itself). Also that data will be emitted as
a 'data' event from radio.

### Sending data to all assimilated streams

```javascript
radio.write('something useful');
```

### Notes

Any stream emitting an 'end' event will be remove from the collective.

calling the end method on radio will end all streams in the collective.
