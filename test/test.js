var write = require('../')
var test = require('tape')
var fs = require('fs')
var expected = fs.readFileSync(__dirname+'/font.bin') 
var bufferEqual = require('buffer-equal')
var font = require('./font.json')
var lato = require('bmfont-lato')

test('writes BMFont JSON to BIN', function(t) {
  var buffer = write(font)
  t.equal(bufferEqual(buffer, expected), true, 'matches AngelCode output')
  t.end()
})

test('should be able to write bmfont-lato', function(t) {
  var buffer = write(lato)
  t.ok(buffer, 'writes bmfont-lato to a buffer')
  t.end()
})

test('writes BMFont JSON to BIN', function(t) {
  var copy = {
    common: font.common,
    info: font.info,
    chars: font.chars,
    pages: font.pages
  }
  var buffer = write(copy)
  t.ok(buffer, 'writes a buffer without kernings')
  t.equal(buffer.length, 3894)
  t.end()
})