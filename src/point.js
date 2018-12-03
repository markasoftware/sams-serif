'use strict'

const assert = require('assert')

module.exports = class Point {
  constructor (arg) {
    if (arg instanceof Point) {
      const oldCartesian = arg.asCartesian()
      this.x = oldCartesian.x
      this.y = oldCartesian.y
    } else if (typeof arg.x === 'number') {
      // cartesian coordinates
      assert(!isNaN(arg.x) && !isNaN(arg.y), 'point constructor not NaN')
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
    // luckily, JavaScript says division by 0 = Infinity and knows how to handle
    // infinite atan properly (PI/2)
    // unfortunately, it still knows that 0/0 is not infinity
    if (this.x === center.x && this.y === center.y) {
      toReturn.angle = 0
    } else {
      toReturn.angle = Math.atan((this.y - center.y) / (this.x - center.x))
      // handle arctan only being defined on (-Pi/2) through (Pi/2)
      if (this.x < center.x) {
        toReturn.angle += Math.PI
      }
    }

    return toReturn
  }

  distanceTo (otherPoint) {
    const otherCartesian = otherPoint.asCartesian()
    return Math.sqrt((otherCartesian.x - this.x) ** 2 + (otherCartesian.y - this.y) ** 2)
  }

  midpointTo (otherPoint) {
    const otherCartesian = otherPoint.asCartesian()
    return new Point({
      x: (this.x + otherCartesian.x) / 2,
      y: (this.y + otherCartesian.y) / 2
    })
  }

  transform (transform) {
    switch (transform.type) {
      case 'translate':
        assert(typeof transform.x === 'number' && typeof transform.y === 'number',
          'x and y both specified')

        // if the angle is zero, it will do it normally, oh well!
        // the rotation is for how the translation amounts should be transformed,
        // not the original points.
        if (transform.angle) {
          // point, vector, it's all the same
          const deltaVector = new Point({ x: transform.x, y: transform.y })
          deltaVector.transform({ type: 'rotate', center: { x: 0, y: 0 }, angle: transform.angle })
          const deltaCartesian = deltaVector.asCartesian()
          this.x += deltaCartesian.x
          this.y += deltaCartesian.y
        } else {
          this.x += transform.x
          this.y += transform.y
        }
        break

      case 'rotate':
        assert(transform.center, 'rotation center not specified')
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
