# write-bmfont-binary

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

Encodes a JSON BMFont into a binary Buffer as per the [BMFont Spec](http://www.angelcode.com/products/bmfont/doc/file_format.html). Can be used in Node or the browser (e.g. with browserify).

```js
var font = require('bmfont-lato')
var write = require('write-bmfont-binary')

//write the font object to a Buffer
var buffer = write(font)
fs.writeFile('fonts/Lato.bin', buffer, function(err) {
  if (err) throw err
})
```

See also: 

- [load-bmfont](https://www.npmjs.com/package/load-bmfont)
- [read-bmfont-binary](https://www.npmjs.com/package/read-bmfont-binary)
- [bmfont2json](https://github.com/mattdesl/bmfont2json)

## Usage

[![NPM](https://nodei.co/npm/write-bmfont-binary.png)](https://www.npmjs.com/package/write-bmfont-binary)

#### `buffer = write(font)`

Writes the JSON `font` to a new Buffer, encoding the binary data with the BMFont spec. 

## License

MIT, see [LICENSE.md](http://github.com/Jam3/write-bmfont-binary/blob/master/LICENSE.md) for details.
