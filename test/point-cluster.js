'use strict'

const test = require('tape')
const Point = require('../src/point')
const PointCluster = require('../src/point-cluster')

test('POINTCLUSTER: Get and set', t => {
  const square = new PointCluster([
    new Point({ x: 0, y: 0 }),
    new Point({ x: 5, y: 0 }),
    new Point({ x: 5, y: 5 }),
    new Point({ x: 0, y: 5 })
  ])
  t.deepEqual(square.getPoints().map(c => c.asCartesian()), [
    { x: 0, y: 0 },
    { x: 5, y: 0 },
    { x: 5, y: 5 },
    { x: 0, y: 5 }
  ])

  t.end()
})

test('POINTCLUSTER: Bounding Box', t => {
  const square = new PointCluster([
    new Point({ x: 0, y: 0 }),
    new Point({ x: 5, y: 0 }),
    new Point({ x: 5, y: 5 }),
    new Point({ x: 0, y: 5 })
  ])
  t.deepEqual(square.getBounds(), { x0: 0, x1: 5, y0: 0, y1: 5 })
  t.deepEqual(square.getBoundingBox().getBounds(), { x0: 0, x1: 5, y0: 0, y1: 5 })

  const booptangle = new PointCluster([
    new Point({ x: 0, y: 1 }),
    new Point({ x: 3.5, y: 0 }),
    new Point({ x: 5, y: 1 }),
    new Point({ x: 2.56, y: 4.999 }),
    new Point({ x: 3, y: 5 })
  ])
  t.deepEqual(booptangle.getBounds(), { x0: 0, x1: 5, y0: 0, y1: 5 })
  t.deepEqual(booptangle.getBoundingBox().getBounds(), { x0: 0, x1: 5, y0: 0, y1: 5 })

  t.end()
})

test('POINTCLUSTER: Transform', t => {
  const square = new PointCluster([
    new Point({ x: 0, y: 0 }),
    new Point({ x: 5, y: 0 }),
    new Point({ x: 5, y: 5 }),
    new Point({ x: 0, y: 5 })
  ])
  square.transform({ type: 'translate', x: 4, y: -3 })
  t.deepEqual(square.getBounds(), { x0: 4, x1: 9, y0: -3, y1: 2 }, 'translated square bounds')
  square.transform({ type: 'translate', x: -4, y: 3 })
  t.deepEqual(square.getBounds(), { x0: 0, x1: 5, y0: 0, y1: 5 }, 'translated back to original position')
  square.transform({ type: 'rotate', center: { x: 2.5, y: 2.5 }, angle: Math.PI / 4 })
  t.deepEqual(square.getBounds(), { x0: 2.5 - Math.sqrt(50) / 2, x1: 2.5 + Math.sqrt(50) / 2, y0: 2.5 - Math.sqrt(50) / 2, y1: 2.5 + Math.sqrt(50) / 2 }, 'rotated square')

  t.end()
})
