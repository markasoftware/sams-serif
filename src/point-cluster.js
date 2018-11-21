'use strict'

const assert = require('assert')
const Box = require('./box')

module.exports = class PointCluster {
  constructor (points) {
    assert(points instanceof Array, 'points arg is an array')
    assert(points.length > 0, 'must be at least one point')
    this.points = points
  }

  getPoints () {
    return this.points
  }

  getBounds () {
    const toReturn = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity }

    for (const point of this.points) {
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
    for (const point of this.points) {
      point.transform(transform)
    }
  }
}
