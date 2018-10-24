'use strict'

const test = require('tape')
const RenderLimiter = require('../src/render-limiter')
const Box = require('../src/box')

const fakeCanvas = {}
const rl = new RenderLimiter(fakeCanvas, new Box({ x0: 0, x1: 10, y0: 0, y1: 10 }), 1, 1, 10)

test('RENDERLIMITER: shouldRender', t => {
  const inbox = new Box({ x0: 9, x1: 10, y0: 5, y1: 9 })
  t.ok(rl.shouldRender(inbox))
  const outbox = new Box({ x0: 55, x1: 57, y0: -12, y1: -5 })
  t.notOk(rl.shouldRender(outbox))

  t.end()
})

test('RENDERLIMITER: setupStroke', t => {
  const midBox = new Box({ x0: 0, x1: 6, y0: 0, y1: 8 })
  rl.setupStroke(midBox)
  t.equal(fakeCanvas.lineWidth, 5)
  t.equal(fakeCanvas.strokeStyle, 'rgb(142,142,142)')

  const thiccBox = new Box({ x0: 5, x1: 305, y0: 5, y1: 405 })
  rl.setupStroke(thiccBox)
  t.equal(fakeCanvas.lineWidth, 250)
  t.equal(fakeCanvas.strokeStyle, 'rgb(0,0,0)')

  t.end()
})
