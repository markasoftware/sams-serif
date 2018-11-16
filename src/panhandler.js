'use strict'

const isMobile = require('is-mobile')
const interact = require('interact.js')
const Box = require('./box')

// general TODO: Use bigints for the viewport, and only switch to normal ints when rendering

module.exports = class Panhandler extends Box {
  constructor (bounds, opts = {}) {
    super(bounds)

    this.pixelsPerLine = opts.pixelsPerLine || 12
    this.pixelsPerPage = opts.pixelsPerPage || 1000
    this.scalePerPixel = opts.scalePerPixel || 1.005

    this.mousePos = false
    this.cbs = []
  }

  addListener (cb) {
    this.cbs.push(cb)
  }

  _triggerListeners () {
    this.cbs.forEach(cb => cb())
  }

  linkEl (el) {
    interact(el)
      .gesturable({
        inertia: isMobile({ tablet: true }),
        onmove: e => {
          this.scale(1 + e.ds, { x: e.clientX, y: e.clientY })
          this._triggerListeners()
        }
      })
      .draggable({
        inertia: isMobile({ tablet: true }),
        onmove: e => {
          this.pan(+e.dx, +e.dy)
          this._triggerListeners()
        }
      })

    el.addEventListener('mousemove', e => {
      this.mousePos = { x: e.clientX, y: e.clientY }
    })
    el.addEventListener('wheel', e => {
      e.preventDefault()
      if (this.mousePos) {
        this.scale(this._wheelToScale(e), this.mousePos)
        this._triggerListeners()
      }
    })
  }

  _wheelToScale (e) {
    // DOM_DELTA_PIXEL: 0, _LINE: 1, _PAGE: 2
    const scrollPixels = (-e.deltaY) * [1, this.pixelsPerLine, this.pixelsPerPage][e.deltaMode]
    return this.scalePerPixel ** scrollPixels
  }
}
