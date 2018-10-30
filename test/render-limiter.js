'use strict'

const test = require('tape')
const RenderLimiter = require('../src/render-limiter')
const Box = require('../src/box')

const fakeCanvas = {
  _filledX: null,
  _filledY: null,
  _filledLength: null,
  fillRect: (x, y, length) => {
    fakeCanvas._filledX = x
    fakeCanvas._filledY = y
    fakeCanvas._filledLength = length
  }
}
const rl = new RenderLimiter(fakeCanvas, new Box({ x0: 0, x1: 10, y0: 0, y1: 10 }), 1, 1, 10)

test('RENDERLIMITER: shouldRender', t => {
  const inbox = new Box({ x0: 9, x1: 10, y0: 5, y1: 9 })
  t.ok(rl.shouldRender(inbox))
  const outbox = new Box({ x0: 55, x1: 57, y0: -12, y1: -5 })
  t.notOk(rl.shouldRender(outbox))

  t.end()
})

test('RENDERLIMITER: shouldRenderRadius', t => {
  t.ok(rl.shouldRenderRadius(1.1))
  t.ok(rl.shouldRenderRadius(1002.1))
  t.notOk(rl.shouldRenderRadius(0.99))

  t.end()
})

test('RENDERLIMITER: preDraw', t => {
  rl.preDraw(5)
  t.equal(fakeCanvas.lineWidth, 5)
  t.equal(fakeCanvas.strokeStyle, 'rgb(142,142,142)')
  t.equal(fakeCanvas.fillStyle, 'rgb(142,142,142)')

  rl.preDraw(250)
  t.equal(fakeCanvas.lineWidth, 250)
  t.equal(fakeCanvas.strokeStyle, 'rgb(0,0,0)')
  t.equal(fakeCanvas.fillStyle, 'rgb(0,0,0)')

  t.end()
})
