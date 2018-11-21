'use strict'

const assert = require('assert')

module.exports = class Point {
  constructor (arg) {
    if (typeof arg.x === 'number') {
      // cartesian coordinates
      this.x = arg.x
      this.y = arg.y
    } else if (arg.center) {
      // polar coordinates
      this.x = Math.cos(arg.angle) * arg.radius + arg.center.x
      this.y = Math.sin(arg.angle) * arg.radius + arg.center.y
    }
  }

  asCartesian () {
    return {
      x: this.x,
      y: this.y
    }
  }

  asPolar (center) {
    const toReturn = {}

    toReturn.center = center
    toReturn.radius = Math.sqrt((this.x - center.x) ** 2 + (this.y - center.y) ** 2)
    toReturn.angle = Math.atan((this.y - center.y) / (this.x - center.x))
    // handle arctan only being defined on (-Pi/2) through (Pi/2)
    if (this.y < center.y) {
      toReturn.angle += Math.PI
    }

    return toReturn
  }

  transform (transform) {
    switch (transform.type) {
      case 'translate':
        this.x += transform.x
        this.y += transform.y
        break
      case 'rotate':
        const polar = this.asPolar(transform.center)
        // you could do modulo Math.PI*2 but JavaScript's modulo function is broken and it doesn't matter
        polar.angle += transform.angle
        const rotatedPoint = new Point({ center: transform.center, radius: polar.radius, angle: polar.angle })
        this._clone(rotatedPoint)
        break
      case 'scale':
        this.x = transform.center.x + (this.x - transform.center.x) * transform.scale
        this.y = transform.center.y + (this.y - transform.center.y) * transform.scale
        break
      default:
        assert(false, 'Invalid transform type in point')
    }
  }

  // sets the x and y values of this point to that of another
  _clone (otherPoint) {
    const otherCartesian = otherPoint.asCartesian()
    this.x = otherCartesian.x
    this.y = otherCartesian.y
  }
}
