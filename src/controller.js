'use strict'

const assert = require('lazy-ass')
const Box = require('./box')
const KeyLogger = require('./keylogger')
const PanHandler = require('./panhandler')
const Renderer = require('./renderer')

module.exports = class Controller {
  constructor (canvasEl, dragEl, keyLoggerEl, font) {
    this.font = font
    this.canvasEl = canvasEl
    this.dragEl = dragEl
    this.keyLoggerEl = keyLoggerEl

    this.awaitingRaf = false
    this.linked = false
  }

  link () {
    assert(!this.linked)
    this.linked = true

    // also sets this.canvasViewport
    this._linkCanvas()

    this.keyLogger = new KeyLogger()
    this.panHandler = new PanHandler(this.canvasViewport.getBounds())
    this.keyLogger.linkEl(this.keyLoggerEl)
    this.panHandler.linkEl(this.dragEl)
    this.keyLogger.addListener(this._raf.bind(this))
    this.panHandler.addListener(this._raf.bind(this))
  }

  _linkCanvas () {
    const canvasBounds = {x0: 0, y0: 0, x1: window.innerWidth, y1: window.innerHeight}
    this.canvasViewport = new Box(canvasBounds)

    this.canvasCtx = this.canvasEl.getContext('2d')
    this.canvasEl.width = canvasBounds.x1
    this.canvasEl.height = canvasBounds.y1
  }

  _raf () {
    if (this.awaitingRaf) {
      return
    }
    requestAnimationFrame(this._render.bind(this))
  }

  _render () {
    const renderer = new Renderer(
      this.font,
      this.keyLogger.getText(),
      this.canvasCtx,
      this.canvasViewport,
      this.panHandler, // panHandler extends Box
    )
    renderer.render()
  }
}
