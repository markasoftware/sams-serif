'use strict'

const assert = require('assert')
const Stats = require('stats.js')
const Box = require('./box')
const KeyLogger = require('./keylogger')
const PanHandler = require('./panhandler')
const Renderer = require('./renderer')
const Config = require('./config')

module.exports = class Controller {
  constructor (canvasEl, dragEl, keyLoggerEl, statsEl, font) {
    this.font = font
    this.canvasEl = canvasEl
    this.dragEl = dragEl
    this.keyLoggerEl = keyLoggerEl
    this.statsEl = statsEl

    this.config = new Config()

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
    this.config.addListener(this._raf.bind(this))

    this.stats = new Stats()
    this.stats.showPanel(1)
    this.statsEl.appendChild(this.stats.dom)
  }

  _linkCanvas () {
    this.canvasCtx = this.canvasEl.getContext('2d')

    // TODO: this dpiRatio stuff I got from some article online doesn't actually work -- it still looks fuzzy on mobile
    const devicePixelRatio = window.devicePixelRatio || 1
    const backingStoreRatio = this.canvasCtx.backingStorePixelRatio || 1
    const dpiRatio = devicePixelRatio / backingStoreRatio
    this.canvasCtx.scale(dpiRatio, dpiRatio)

    const canvasBounds = { x0: 0, y0: 0, x1: window.innerWidth, y1: window.innerHeight }
    this.canvasViewport = new Box(canvasBounds)
    this.canvasEl.width = window.innerWidth * dpiRatio
    this.canvasEl.height = canvasBounds.y1 * dpiRatio
    this.canvasEl.style.width = window.innerWidth
    this.canvasEl.style.height = window.innerHeight
  }

  _raf () {
    if (this.awaitingRaf) {
      return
    }
    requestAnimationFrame(this._render.bind(this))
  }

  _render () {
    const renderer = new Renderer(
      this.font(this.config.getSamsSerifConfig()),
      this.keyLogger.getText(),
      this.canvasCtx,
      this.canvasViewport,
      this.panHandler, // panHandler extends Box
      this.config.getRenderOpts()
    )
    this.stats.begin()
    renderer.render()
    this.stats.end()
  }
}
