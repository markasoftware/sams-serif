'use strict'

const test = require('tape')
const Panhandler = require('../src/panhandler')

test('PANHANDLER: _wheelToScale', t => {
  const pan = new Panhandler({ x0: 0, x1: 10, y0: 0, y1: 10 }, { scalePerPixel: 2 })
  t.equal(pan._wheelToScale({ deltaMode: 0, deltaY: 5 }), 1 / 32)
  t.equal(pan._wheelToScale({ deltaMode: 0, deltaY: -5 }), 32)

  t.end()
})
