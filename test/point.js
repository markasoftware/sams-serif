'use strict'

const test = require('tape')
const Point = require('../src/point')

test('POINT: Coordinate systems', t => {
  const pt34 = new Point({ x: 3, y: 4 })
  t.deepEqual(pt34.asCartesian(), { x: 3, y: 4 }, 'cartesian as cartesian')
  t.deepEqual(pt34.asPolar({ x: 0, y: 0 }), { center: { x: 0, y: 0 }, radius: 5, angle: Math.atan(4 / 3) }, 'cartesian as polar')
  const pt22 = new Point({ center: { x: 0, y: 0 }, radius: Math.sqrt(8), angle: Math.PI / 4 })
  t.ok(Math.abs(pt22.asCartesian().x - 2) < 0.001, 'polar to cartesian x')
  t.ok(Math.abs(pt22.asCartesian().y - 2) < 0.001, 'polar to cartesian y')

  t.end()
})

test('POINT: Coordinate systems with interesting values', t => {
  const pt34 = new Point({ x: 3, y: 4 })
  t.deepEqual(pt34.asPolar({ x: 1, y: 2 }), { center: { x: 1, y: 2 }, radius: Math.sqrt(8), angle: Math.PI / 4 }, 'cartesian as polar')

  const pt33 = new Point({ center: { x: 1, y: 1 }, radius: Math.sqrt(8), angle: -Math.PI / 4 })
  t.ok(Math.abs(pt33.asCartesian().x - 3) < 0.001, 'polar to cartesian x')
  t.ok(Math.abs(pt33.asCartesian().y + 1) < 0.001, 'polar to cartesian y')

  const pt22 = new Point({ x: -Math.sqrt(2), y: Math.sqrt(2) })
  t.deepEqual(pt22.asPolar({ x: 0, y: 0 }), { center: { x: 0, y: 0 }, radius: 2, angle: 3 / 4 * Math.PI }, '135 degree cartesian to polar')

  const pt00 = new Point({ x: 0, y: 0 })
  t.deepEqual(pt00.asCartesian(), { x: 0, y: 0 }, 'zero zero')

  t.end()
})

test('POINT: Distance', t => {
  const pt34 = new Point({ x: 3, y: 4 })
  const ptNegative = new Point({ x: -1, y: 7 })
  t.equal(pt34.distanceTo(ptNegative), 5, '3,4 to -1,7')
  t.equal(ptNegative.distanceTo(pt34), 5, '-1,7 to 3,4')

  t.end()
})

test('POINT: Translate', t => {
  const pt34 = new Point({ x: 3, y: 4 })
  pt34.transform({ type: 'translate', x: -5, y: 1 })
  t.deepEqual(pt34.asCartesian(), { x: -2, y: 5 }, 'simple translate')

  const pt22 = new Point({ x: 2, y: 2 })
  pt22.transform({ type: 'translate', angle: Math.PI / 2, x: 2, y: 0 })
  t.deepEqual(pt22.asCartesian(), { x: 2, y: 4 }, 'translate with 90 degree angle')

  const pt14 = new Point({ x: 1, y: 4 })
  pt14.transform({ type: 'translate', angle: -Math.PI / 4, x: -Math.sqrt(2), y: Math.sqrt(2) })
  t.ok(Math.abs(pt14.asCartesian().x - 1) < 0.001, '45deg rotate x')
  t.ok(Math.abs(pt14.asCartesian().y - 6) < 0.001, '45deg rotate y')

  t.end()
})

test('POINT: Rotate', t => {
  const pt34 = new Point({ x: 3, y: 4 })
  pt34.transform({ type: 'rotate', center: { x: 1, y: 2 }, angle: Math.PI })
  t.ok(Math.abs(pt34.asCartesian().x - (-1)) < 0.001, 'simple rotate x')
  t.ok(Math.abs(pt34.asCartesian().y - 0) < 0.001, 'simple rotate y')

  // negative angles and shit, atan is garbage
  const pt05 = new Point({ x: 0, y: 5 })
  pt05.transform({ type: 'rotate', center: { x: 2.5, y: 2.5 }, angle: -Math.PI / 2 })
  t.ok(Math.abs(pt05.asCartesian().x - 5) < 0.001, 'other rotate x')
  t.ok(Math.abs(pt05.asCartesian().y - 5) < 0.001, 'other rotate y')

  const pt50 = new Point({ x: 3, y: 0 })
  pt50.transform({ type: 'rotate', center: { x: 0, y: 0 }, angle: -Math.PI / 4 })
  t.ok(Math.abs(pt50.asCartesian().x - Math.sqrt(4.5)) < 0.001, 'negative rotate x')
  t.ok(Math.abs(pt50.asCartesian().y + Math.sqrt(4.5)) < 0.001, 'negative rotate y')

  const pt00 = new Point({ x: 0, y: 0 })
  pt00.transform({ type: 'rotate', center: { x: 0, y: 0 }, angle: Math.PI * 8.72 })
  t.deepEqual(pt00.asCartesian(), { x: 0, y: 0 }, 'point is origin')

  t.end()
})

test('POINT: Scale', t => {
  const pt34 = new Point({ x: 3, y: 4 })
  pt34.transform({ type: 'scale', center: { x: -1, y: 0 }, scale: 0.5 })
  t.deepEqual(pt34.asCartesian(), { x: 1, y: 2 })

  const pt55 = new Point({ x: -5, y: -5 })
  pt55.transform({ type: 'scale', center: { x: -10, y: -10 }, scale: 2 })
  t.deepEqual(pt55.asCartesian(), { x: 0, y: 0 })

  t.end()
})

// scale doesn't make sense on a single point.
