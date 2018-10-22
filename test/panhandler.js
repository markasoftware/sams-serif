'use strict'

const test = require('tape')
const Panhandler = require('../src/panhandler')

test('PANHANDLER: Drag', t => {
  const pan = new Panhandler({ x0: 0, x1: 10, y0: 0, y1: 10 })
  pan.dragStart(5, 5)
  pan.dragUpdate(6, 4)
  t.deepEqual(pan.getBounds(), { x0: 1, x1: 11, y0: -1, y1: 9 })

  t.end()
})

test('PANHANDLER: _wheelToScale', t => {
  const pan = new Panhandler({ x0: 0, x1: 10, y0: 0, y1: 10 }, { scalePerPixel: 2 })
  t.equal(pan._wheelToScale({ deltaMode: 0, deltaY: 5 }), 32)
  t.equal(pan._wheelToScale({ deltaMode: 0, deltaY: -5 }), 1 / 32)

  t.end()
})
