/* jshint maxlen: 110 */

var path = require('path')
var fs = require('fs')
var mm = require('..')
var test = require('tape')

test('id3v2.4', function (t) {
  t.plan(57)
  var apicCounter = 0
  var tconCounter = 0
  var tpe1Counter = 0
  var privCounter = 0

  var sample = (process.browser) ?
    new window.Blob([fs.readFileSync(__dirname + '/samples/id3v2.4.mp3')])
    : fs.createReadStream(path.join(__dirname, '/samples/id3v2.4.mp3'))

  mm.parseStream(sample, {'duration': true}, function (err, result) {
    t.error(err)

    t.strictEqual(result.format.headerType, 'id3v2.4', 'format.headerType')
    t.strictEqual(result.format.duration, 1, 'format.format.duration')
    t.strictEqual(result.format.sampleRate, 44100, 'format.sampleRate = 44.1 kHz')
    t.strictEqual(result.format.bitrate, 128000, 'format.bitrate = 128 kbit/sec')
    t.strictEqual(result.format.codecProfile, 'CBR', 'format.codecProfile = CBR')
    t.strictEqual(result.format.encoder, 'LAME3.98r', 'format.encoder = LAME3.98r')
    t.strictEqual(result.format.numberOfChannels, 2, 'format.numberOfChannels = 2')

    t.strictEqual(result.common.title, 'Home', 'title')
    t.strictEqual(result.common.artist, undefined, 'common.artist')
    t.deepEqual(result.common.artists, [ 'Explo', 'ions', 'nodejsftws' ], 'common.artists')
    t.strictEqual(result.common.albumartist, 'Soundtrack', 'albumartist')
    t.strictEqual(result.common.album, 'Friday Night Lights [Original Movie Soundtrack]', 'album')
    t.strictEqual(result.common.year, 2004, 'year')
    t.deepEqual(result.common.track, {no: 5, of: null}, 'common.track')
    t.deepEqual(result.common.disk, {no: 1, of: 1}, 'common.disk')
    t.deepEqual(result.common.genre, ['Soundtrack', 'OST'], 'common.genres')
    t.strictEqual(result.common.picture[0].format, 'jpg', 'common.picture 0 format')
    t.strictEqual(result.common.picture[0].data.length, 80938, 'common.picture 0 length')
    t.strictEqual(result.common.picture[1].format, 'jpg', 'common.picture 1 format')
    t.strictEqual(result.common.picture[1].data.length, 80938, 'common.picture 1 length')
    t.end()
  })
    .on('duration', function (result) {
      t.strictEqual(result, 1, 'event duration')
    })
    // aliased tests
    .on('title', function (result) {
      t.strictEqual(result, 'Home', 'event common.title')
    })
    .on('artists', function (result) {
      t.deepEqual(result, [ 'Explo', 'ions', 'nodejsftws' ], 'event common.artists')
    })
    .on('albumartist', function (result) {
      t.strictEqual(result, 'Soundtrack', 'common.albumartist')
    })
    .on('album', function (result) {
      t.strictEqual(result, 'Friday Night Lights [Original Movie Soundtrack]', 'event common.album')
    })
    .on('year', function (result) {
      t.strictEqual(result, 2004, 'event common.year')
    })
    .on('track', function (result) {
      t.deepEqual(result, {no: 5, of: null}, 'event common.track')
    })
    .on('disk', function (result) {
      t.deepEqual(result, {no: 1, of: 1}, 'event common.disk')
    })
    .on('genre', function (result) {
      t.deepEqual(result, ['Soundtrack', 'OST'], 'event common.genre')
    })
    .on('picture', function (result) {
      t.strictEqual(result[0].format, 'jpg', 'common.picture 0 format')
      t.strictEqual(result[0].data.length, 80938, 'common.picture 0 length')
      t.strictEqual(result[1].format, 'jpg', 'common.picture 1 format')
      t.strictEqual(result[1].data.length, 80938, 'common.picture 1 length')
    })
    // raw tests
    .on('TALB', function (result) {
      t.strictEqual(result, 'Friday Night Lights [Original Movie Soundtrack]', 'raw TALB')
    })
    .on('TPE1', function (result) {
      if (tpe1Counter === 0) {
        t.strictEqual(result, 'Explo')
      }
      if (tpe1Counter === 1) {
        t.strictEqual(result, 'ions', 'raw TPE1 1')
      }
      if (tpe1Counter === 2) {
        t.strictEqual(result, 'nodejsftws', 'raw TPE1 2')
      }
      tpe1Counter++
    })
    .on('TPE2', function (result) {
      t.strictEqual(result, 'Soundtrack', 'raw TPE2')
    })
    .on('TCOM', function (result) {
      t.strictEqual(result, 'Explosions in the Sky', 'raw TCOM')
    })
    .on('TPOS', function (result) {
      t.strictEqual(result, '1/1', 'raw TPOS')
    })
    .on('TCON', function (result) {
      if (tconCounter === 0) {
        t.strictEqual(result, 'Soundtrack', 'raw TCON 0')
      }
      if (tconCounter === 1) {
        t.strictEqual(result, 'OST', 'raw TCON 1')
      }
      tconCounter++
    })
    .on('TIT2', function (result) {
      t.strictEqual(result, 'Home', 'raw TIT2')
    })
    .on('TRCK', function (result) {
      t.strictEqual(result, '5', 'raw TRCK')
    })
    .on('TDRC', function (result) {
      t.strictEqual(result, '2004', 'raw TDRC')
    })
    .on('TXXX:PERFORMER', function (result) {
      t.strictEqual(result, 'Explosions In The Sky', 'TXXX:PERFORMER')
    })
    .on('PRIV', function (result) {
      switch (privCounter) {
        case 0:
          t.deepEqual(result, {owner_identifier: 'PeakValue',
            data: new Buffer([8, 0, 0, 0])}, 'PRIV:PeakValue')
          break
        case 1:
          t.strictEqual(result.owner_identifier, 'AverageLevel', 'PRIV:AverageValue')
          break
      }

      // t.deepEqual(result.owner_identifier,
      // {owner_identifier: 'PeakValue', data: 'Explosions In The Sky'}, )
      ++privCounter
    })
    .on('APIC', function (result) {
      if (apicCounter === 0) {
        t.strictEqual(result.format, 'image/jpg', 'raw APIC 0 format')
        t.strictEqual(result.type, 'Cover (front)', 'raw APIC 0 headerType')
        t.strictEqual(result.description, 'some description', 'raw APIC 0 description')
        t.strictEqual(result.data.length, 80938, 'raw APIC 0 length')
      }
      if (apicCounter === 1) {
        t.strictEqual(result.format, 'image/jpeg', 'raw APIC 1 format')
        t.strictEqual(result.type, 'Cover (back)', 'raw APIC 1 headerType')
        t.strictEqual(result.description, 'back', 'raw APIC 1 description')
        t.strictEqual(result.data.length, 80938, 'raw APIC 1 length')
      }
      apicCounter++
    })
})
