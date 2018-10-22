'use strict'

const assert = require('lazy-ass')
const R = require('ramda')

// bounds is {x0, y0, x1, y1}

const pickBounds = R.pick(['x0', 'x1', 'y0', 'y1'])

module.exports = class Box {
  constructor (bounds) {
    assert(bounds.y1 >= bounds.y0 && bounds.x1 >= bounds.x0)
    Object.assign(this, pickBounds(bounds))
  }

  getBounds () {
    return pickBounds(this)
  }

  getRadius () {
    return 0.5 * Math.sqrt((this.x1 - this.x0) ** 2 + (this.y1 - this.y0) ** 2)
  }

  getCenter () {
    return { x: (this.x1 - this.x0) / 2 + this.x0, y: (this.y1 - this.y0) / 2 + this.y0 }
  }

  getDimensions () {
    return { x: this.x1 - this.x0, y: this.y1 - this.y0 }
  }

  // ENHANCEMENT: zoom into a certain point
  scale (percent) {
    const center = this.getCenter()
    const dim = this.getDimensions()
    this.y0 = center.y - dim.y * percent / 2
    this.y1 = center.y + dim.y * percent / 2
    this.x0 = center.x - dim.x * percent / 2
    this.x1 = center.x + dim.x * percent / 2
  }

  pan (x, y) {
    this.x0 += x
    this.x1 += x
    this.y0 += y
    this.y1 += y
  }

  static boundsIntersect (bounds0, bounds1) {
    // make sure it is not completely to the left, then that it's not completely to the right, etc
    // sort of elegant seeming, until you look at the code.
    return bounds0.x1 >= bounds1.x0 && bounds0.x0 <= bounds1.x1 && bounds0.y1 >= bounds1.y0 && bounds0.y0 <= bounds1.y1
  }
}
