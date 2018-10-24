'use strict'

const assert = require('assert')

// bounds is {x0, y0, x1, y1}

module.exports = class Box {
  constructor (bounds) {
    assert(typeof bounds === 'object')
    assert(['x0', 'x1', 'y0', 'y1'].every(c => c in bounds))
    assert(bounds.y1 >= bounds.y0 && bounds.x1 >= bounds.x0, 'bounds not rectagonal')
    this.x0 = bounds.x0
    this.x1 = bounds.x1
    this.y0 = bounds.y0
    this.y1 = bounds.y1
  }

  getBounds () {
    return { x0: this.x0, x1: this.x1, y0: this.y0, y1: this.y1 }
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

  scale (percent, center = this.getCenter()) {
    this.y0 = center.y - (center.y - this.y0) * percent
    this.y1 = center.y - (center.y - this.y1) * percent
    this.x0 = center.x - (center.x - this.x0) * percent
    this.x1 = center.x - (center.x - this.x1) * percent
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
