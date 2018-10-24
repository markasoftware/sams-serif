'use strict'

const test = require('tape')
const Box = require('../src/box')

test('BOX: Get properties', t => {
  const box = new Box({ x0: 0, x1: 10, y0: 0, y1: 10 })
  t.deepEqual(box.getCenter(), { x: 5, y: 5 })
  t.deepEqual(box.getDimensions(), { x: 10, y: 10 })
  t.deepEqual(box.getBounds(), { x0: 0, x1: 10, y0: 0, y1: 10 })
  t.equal(box.getRadius(), Math.sqrt(200) / 2)

  const otherBox = new Box({ x0: 10, x1: 20, y0: 10, y1: 20 })
  t.deepEqual(otherBox.getCenter(), { x: 15, y: 15 })

  t.end()
})

test('BOX: scale', t => {
  const box = new Box({ x0: 0, x1: 10, y0: 0, y1: 10 })
  box.scale(0.5)
  t.deepEqual(box.getBounds(), { x0: 2.5, x1: 7.5, y0: 2.5, y1: 7.5 })
  box.scale(4)
  t.deepEqual(box.getBounds(), { x0: -5, x1: 15, y0: -5, y1: 15 })
  box.scale(2, { x: 0, y: 0 })
  t.deepEqual(box.getBounds(), { x0: -10, x1: 30, y0: -10, y1: 30 })

  const otherBox = new Box({ x0: 50, x1: 150, y0: 100, y1: 200 })
  otherBox.scale(0.5)
  t.deepEqual(otherBox.getBounds(), { x0: 75, x1: 125, y0: 125, y1: 175 })

  t.end()
})

test('BOX: pan', t => {
  const box = new Box({ x0: 0, x1: 10, y0: 0, y1: 10 })
  box.pan(5, 5)
  t.deepEqual(box.getBounds(), { x0: 5, x1: 15, y0: 5, y1: 15 })

  t.end()
})

test('BOX: boundsIntersect', t => {
  const basicBounds = { x0: 5, x1: 10, y0: 5, y1: 10 }
  const fullyContained = { x0: 7, x1: 8, y0: 7, y1: 8 }
  const intersecting = { x0: -4, x1: 6, y0: 9, y1: 19 }
  const edgeIntersecting = { x0: 10, x1: 20, y0: 10, y1: 10 }
  const outside = { x0: 15, x1: 20, y0: 989, y1: 8388 }

  t.ok(Box.boundsIntersect(basicBounds, fullyContained))
  t.ok(Box.boundsIntersect(basicBounds, intersecting))
  t.ok(Box.boundsIntersect(basicBounds, edgeIntersecting))
  t.notOk(Box.boundsIntersect(basicBounds, outside))

  t.end()
})
