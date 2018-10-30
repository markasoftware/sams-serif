'use strict'

const test = require('tape')
const Panhandler = require('../src/panhandler')

test('PANHANDLER: Drag', t => {
  const pan = new Panhandler({ x0: 0, x1: 10, y0: 0, y1: 10 })
  pan._mouseUpdate(5, 5)
  pan._dragStart()
  pan._mouseUpdate(6, 4)
  pan._dragEnd()
  t.deepEqual(pan.getBounds(), { x0: 1, x1: 11, y0: -1, y1: 9 })

  t.end()
})

test('PANHANDLER: Drag with no previous mouse position', t => {
  const pan = new Panhandler({ x0: 0, x1: 10, y0: 0, y1: 10 })
  pan._dragStart()
  pan._mouseUpdate(6, 4)
  pan._dragEnd()
  t.deepEqual(pan.getBounds(), { x0: 0, x1: 10, y0: 0, y1: 10 })

  t.end()
})

test('PANHANDLER: _wheelToScale', t => {
  const pan = new Panhandler({ x0: 0, x1: 10, y0: 0, y1: 10 }, { scalePerPixel: 2 })
  t.equal(pan._wheelToScale({ deltaMode: 0, deltaY: 5 }), 1 / 32)
  t.equal(pan._wheelToScale({ deltaMode: 0, deltaY: -5 }), 32)

  t.end()
})

test('PANHANDLER: Listeners', t => {
  t.plan(2)

  const pan = new Panhandler({ x0: 0, x1: 10, y0: 0, y1: 10 })
  pan.addListener(() => t.pass())
  // should not trigger
  pan._mouseUpdate(5, 5)
  pan._dragStart()
  pan._dragEnd()
  pan._dragStart()
  // triggers
  pan._mouseUpdate(6, 6)
  // triggers
  pan._scaleWithMouse(2)
  // no trigger
  pan._dragEnd()
})
