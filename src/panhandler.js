'use strict'

const Box = require('./box')

// general TODO: Use bigints for the viewport, and only switch to normal ints when rendering

module.exports = class Panhandler extends Box {
  constructor (bounds, opts = {}) {
    super(bounds)

    this.pixelsPerLine = opts.pixelsPerLine || 12
    this.pixelsPerPage = opts.pixelsPerPage || 1000
    this.scalePerPixel = opts.scalePerPixel || 1.005

    this.dragState = false
    this.cbs = []
  }

  addListener (cb) {
    this.cbs.push(cb)
  }

  _triggerListeners () {
    this.cbs.forEach(cb => cb())
  }

  linkEl (el) {
    el.addEventListener('wheel', e => {
      e.preventDefault()
      this._scaleWithMouse(this._wheelToScale(e))
    })
    el.addEventListener('mousedown', e => {
      this._dragStart()
    })
    el.addEventListener('mousemove', e => {
      this._mouseUpdate(e.clientX, e.clientY)
    })
    el.addEventListener('mouseup', e => {
      this._dragEnd()
    })
    el.addEventListener('mouseleave', e => {
      this._dragEnd()
    })
  }

  _wheelToScale (e) {
    // DOM_DELTA_PIXEL: 0, _LINE: 1, _PAGE: 2
    const scrollPixels = (-e.deltaY) * [1, this.pixelsPerLine, this.pixelsPerPage][e.deltaMode]
    return this.scalePerPixel ** scrollPixels
  }

  _scaleWithMouse (scaleFrac) {
    this.scale(scaleFrac, { x: this.mouseX, y: this.mouseY })
    this._triggerListeners()
  }

  _mouseUpdate (x, y) {
    const oldX = this.mouseX
    const oldY = this.mouseY
    this.mouseX = x
    this.mouseY = y
    if (this._isDragging() && typeof oldX === 'number') {
      this.pan(x - oldX, y - oldY)
      this._triggerListeners()
    }
  }

  _isDragging () {
    return !!this.dragState
  }

  _dragStart () {
    this.dragState = true
  }

  _dragEnd () {
    this.dragState = false
  }
}
