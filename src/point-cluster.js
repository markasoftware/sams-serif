'use strict'

const assert = require('assert')
const mapValues = require('just-map-values')

const Box = require('./box')
const Point = require('./point')

module.exports = class PointCluster {
  constructor (points) {
    if (points instanceof PointCluster) {
      this.points = mapValues(points.getPoints(), c => new Point(c))
    } else {
      assert(Object.keys(points).length > 0, 'must be at least one point')
      this.points = points
    }
  }

  getPoints () {
    return this.points
  }

  getBounds () {
    const toReturn = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity }

    for (const point of Object.values(this.points)) {
      const cartesian = point.asCartesian()
      toReturn.x0 = Math.min(toReturn.x0, cartesian.x)
      toReturn.y0 = Math.min(toReturn.y0, cartesian.y)
      toReturn.x1 = Math.max(toReturn.x1, cartesian.x)
      toReturn.y1 = Math.max(toReturn.y1, cartesian.y)
    }

    return toReturn
  }

  getBoundingBox () {
    return new Box(this.getBounds())
  }

  transform (transform) {
    for (const point of Object.values(this.points)) {
      point.transform(transform)
    }
  }
}
