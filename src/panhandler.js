'use strict'

const assert = require('lazy-ass')
const Box = require('./box')

module.exports = class Panhandler extends Box {
  constructor (bounds, opts = {}) {
    super(bounds)

    this.pixelsPerLine = opts.pixelsPerLine || 12
    this.pixelsPerPage = opts.pixelsPerPage || 1000
    this.scalePerPixel = opts.scalePerPixel || 1.005

    this.dragState = false
    this.cbs = []
  }
  
  addListener(cb) {
    this.cbs.push(cb)
  }

  linkEl (el) {
    el.addEventListener('wheel', e => {
      e.preventDefault()
      super.scale(this._wheelToScale(e))
      this._triggerListeners()
    })
    el.addEventListener('mousedown', e => {
      this.dragStart(e.clientX, e.clientY)
    })
    el.addEventListener('mousemove', e => {
      if (this.isDragging()) {
        this.dragUpdate(e.clientX, e.clientY)
        this._triggerListeners()
      }
    })
    el.addEventListener('mouseup', e => {
      this.dragEnd()
      this._triggerListeners()
    })
    el.addEventListener('mouseleave', e => {
      this.dragEnd()
      this._triggerListeners()
    })
  }

  _wheelToScale (e) {
    // DOM_DELTA_PIXEL: 0, _LINE: 1, _PAGE: 2
    const scrollPixels = e.deltaY * [1, this.pixelsPerLine, this.pixelsPerPage][e.deltaMode]
    return this.scalePerPixel ** scrollPixels
  }

  isDragging () {
    return !!this.dragState
  }

  dragStart (x, y) {
    this.dragState = { x, y }
  }

  dragUpdate (x, y) {
    assert(this.isDragging())
    super.pan(x - this.dragState.x, y - this.dragState.y)
    this.dragState = { x, y }
  }

  dragEnd () {
    this.dragState = false
  }
}
