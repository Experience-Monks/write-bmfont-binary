var VERSION = 3
var SmartBuffer = require('smart-buffer')
var NUL = new Buffer([0x00])
var BLOCK = 5

module.exports = function writeBMFontBinary(font) {
  var header = new Buffer([
    66, 77, 70, VERSION
  ])

  var infoBuf = createInfo(font.info)
  var commonBuf = createCommon(font.common)
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

function block(id, size, blockSize) {
  blockSize = typeof blockSize === 'number' ? blockSize : size
  var buf = new Buffer(BLOCK + size)
  //id / blockSize
  buf.writeUInt8(id, 0)
  buf.writeInt32LE(blockSize, 1)
  return buf
}

function createInfo(info) {
  var name = Buffer.concat([
    new Buffer(info.face, 'utf8'),
    NUL
  ])

  var i = BLOCK
  var infoSize = 14
  var buf = block(1, infoSize, infoSize+name.length)
  //fontSize
  buf.writeInt16LE(info.size, i)
  //bitField & charSet
  buf.writeUInt8(0, i+2) //not yet supported
  buf.writeUInt8(0, i+3) //not yet supported
  buf.writeUInt16LE(info.stretchH, i+4)
  buf.writeUInt8(info.aa, i+6)
  info.padding.forEach(function(val, c) {
    buf.writeUInt8(val, i+7+c)
  })
  info.spacing.forEach(function(val, c) {
    buf.writeUInt8(val, i+11+c)
  })
  buf.writeUInt8(info.outline, i+13)
  return Buffer.concat([
    buf,
    name
  ])
}

function createCommon(common) {
  var i = BLOCK
  var commonSize = 15
  var buf = block(2, commonSize)

  buf.writeUInt16LE(common.lineHeight, i)
  buf.writeUInt16LE(common.base, i+2)
  buf.writeUInt16LE(common.scaleW, i+4)
  buf.writeUInt16LE(common.scaleH, i+6)
  buf.writeUInt16LE(common.pages, i+8)
  buf.writeUInt8(0, i+10) //packed not yet supported
  buf.writeUInt8(common.alphaChnl, i+11)
  buf.writeUInt8(common.redChnl, i+12)
  buf.writeUInt8(common.greenChnl, i+13)
  buf.writeUInt8(common.blueChnl, i+14)
  return buf
}

function createPages(pages) {
  var names = Buffer.concat(pages.map(function(str) {
    return Buffer.concat([
      new Buffer(str, 'utf8'),
      NUL
    ])
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
    buf.writeUInt32LE(char.id, i + 0 + off)
    buf.writeUInt16LE(char.x, i + 4 + off)
    buf.writeUInt16LE(char.y, i + 6 + off)
    buf.writeUInt16LE(char.width, i + 8 + off)
    buf.writeUInt16LE(char.height, i + 10 + off)
    buf.writeInt16LE(char.xoffset, i + 12 + off)
    buf.writeInt16LE(char.yoffset, i + 14 + off)
    buf.writeInt16LE(char.xadvance, i + 16 + off)
    buf.writeUInt8(char.page, i + 18 + off)
    buf.writeUInt8(char.chnl, i + 19 + off)
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
    buf.writeUInt32LE(kern.first, i + 0 + off)
    buf.writeUInt32LE(kern.second, i + 4 + off)
    buf.writeInt16LE(kern.amount, i + 8 + off)
  })
  return buf
}