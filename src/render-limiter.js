'use strict'

const R = require('ramda')
const Box = require('./box')

module.exports = class RenderLimiter {
  constructor (canvasCtx, canvasViewport, widthOverRadius, minRadius, minBlackRadius) {
    this.canvasCtx = canvasCtx
    this.canvasViewport = canvasViewport
    this.widthOverRadius = widthOverRadius
    this.minRadius = minRadius
    this.minBlackRadius = minBlackRadius
  }

  shouldRender (box) {
    return Box.boundsIntersect(this.canvasViewport.getBounds(), box.getBounds()) && box.getRadius() >= this.minRadius
  }

  setupStroke (box) {
    this.canvasCtx.beginPath()
    this.canvasCtx.lineWidth = this.widthOverRadius * box.getRadius()
    const strokeIntensity = 255 - R.clamp(0, 255, Math.round((box.getRadius() - this.minRadius) / (this.minBlackRadius - this.minRadius) * 255))
    this.canvasCtx.strokeStyle = `rgb(${strokeIntensity},${strokeIntensity},${strokeIntensity})`
  }

  endStroke() {
    this.canvasCtx.stroke()
  }
}