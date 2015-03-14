var number = require('as-number')
var VERSION = 3
var NUL = new Buffer([0x00])
var BLOCK = 5
var HEADER = [
  66, 77, 70, VERSION
]

module.exports = function writeBMFontBinary(font) {
  var header = new Buffer(HEADER)

  var infoBuf = createInfo(font.info)
  var commonBuf = createCommon(font.common, font)
  var pages = createPages(font.pages)
  var chars = createChars(font.chars)
  var kernings = createKernings(font.kernings)
  return Buffer.concat([
    header,
    infoBuf,
    commonBuf,
    pages,
    chars,
    kernings
  ])  
}

function nulstr(str) {
  return Buffer.concat([
    new Buffer(str, 'utf8'),
    NUL
  ])
}

function block(id, size, blockSize) {
  blockSize = number(blockSize, size)
  var buf = new Buffer(BLOCK + size)
  //id / blockSize
  buf.writeUInt8(id, 0)
  buf.writeInt32LE(blockSize, 1)
  return buf
}

function bitset(field, n) {
  field ^= (-1 ^ field) & (1 << n)
  return field
}

function createInfo(info) {
  var name = nulstr(info.face)

  var i = BLOCK
  var infoSize = 14
  var buf = block(1, infoSize, infoSize+name.length)
  var fontSize = info.size||0
  buf.writeInt16LE(fontSize, i)

  //bit fields
  var field = 0x00
  if (info.smooth)
    field = bitset(field, 7)
  if (info.unicode)
    field = bitset(field, 6)
  if (info.italic)
    field = bitset(field, 5)
  if (info.bold)
    field = bitset(field, 4)
  if (info.fixedHeight)
    field = bitset(field, 3)
  buf.writeUInt8(field, i+2)

  var stretchH = number(info.stretchH, 100)

  //charSet OEM, not yet supported
  buf.writeUInt8(0, i+3) 
  buf.writeUInt16LE(stretchH, i+4)
  buf.writeUInt8(info.aa||0, i+6)
  info.padding.forEach(function(val, c) {
    buf.writeUInt8(val||0, i+7+c)
  })
  info.spacing.forEach(function(val, c) {
    buf.writeUInt8(val||0, i+11+c)
  })
  buf.writeUInt8(info.outline||0, i+13)
  return Buffer.concat([
    buf,
    name
  ])
}

function createCommon(common, font) {
  var i = BLOCK
  var commonSize = 15
  var buf = block(2, commonSize)
  var pages = number(common.pages, font.pages.length)

  buf.writeUInt16LE(common.lineHeight||0, i)
  buf.writeUInt16LE(common.base||0, i+2)
  buf.writeUInt16LE(common.scaleW||0, i+4)
  buf.writeUInt16LE(common.scaleH||0, i+6)
  buf.writeUInt16LE(pages, i+8)
  buf.writeUInt8(0, i+10) //packed not yet supported
  buf.writeUInt8(number(common.alphaChnl, 1), i+11)
  buf.writeUInt8(common.redChnl||0, i+12)
  buf.writeUInt8(common.greenChnl||0, i+13)
  buf.writeUInt8(common.blueChnl||0, i+14)
  return buf
}

function createPages(pages) {
  var names = Buffer.concat(pages.map(function(str) {
    return nulstr(str)
  }))

  var buf = new Buffer(BLOCK)
  //id / blockSize
  buf.writeUInt8(3, 0)
  buf.writeInt32LE(names.length, 1)
  return Buffer.concat([
    buf,
    names
  ])
}

function createChars(chars) {
  var i = BLOCK
  var charsSize = 20 * chars.length
  var buf = block(4, charsSize)
  chars.forEach(function(char, c) {
    var off = c*20
    if (typeof char.id !== 'number')
      throw new Error('malformed font object, glyph has no ID: '+char)
    buf.writeUInt32LE(char.id, i + 0 + off)
    buf.writeUInt16LE(char.x||0, i + 4 + off)
    buf.writeUInt16LE(char.y||0, i + 6 + off)
    buf.writeUInt16LE(char.width||0, i + 8 + off)
    buf.writeUInt16LE(char.height||0, i + 10 + off)
    buf.writeInt16LE(char.xoffset||0, i + 12 + off)
    buf.writeInt16LE(char.yoffset||0, i + 14 + off)
    buf.writeInt16LE(char.xadvance||0, i + 16 + off)
    buf.writeUInt8(char.page||0, i + 18 + off)
    buf.writeUInt8(number(char.chnl, 15), i + 19 + off)
  })
  return buf
}

function createKernings(kernings) {
  if (!kernings || !kernings.length)
    return new Buffer(0)
  var i = BLOCK
  var kernSize = 10 * kernings.length
  var buf = block(5, kernSize)
  kernings.forEach(function(kern, c) {
    var off = c*10
    if (typeof kern.first !== 'number'
        || typeof kern.second !== 'number')
      throw new Error('malformed font object; kerning pairs do not have first/second char IDs')
    buf.writeUInt32LE(kern.first, i + 0 + off)
    buf.writeUInt32LE(kern.second, i + 4 + off)
    buf.writeInt16LE(kern.amount||0, i + 8 + off)
  })
  return buf
}