'use strict'

const Box = require('./box')

const clamp = (low, hi, mid) => mid > hi ? hi : mid < low ? low : mid

module.exports = class RenderLimiter {
  constructor (canvasCtx, canvasViewport, widthOverRadius, minRadius, minBlackRadius) {
    this.canvasCtx = canvasCtx
    this.canvasViewport = canvasViewport
    this.widthOverRadius = widthOverRadius
    this.minRadius = minRadius
    this.minBlackRadius = minBlackRadius
  }

  shouldRenderRadius(radius) {
    return radius >= this.minRadius
  }

  shouldRender (box) {
    return Box.boundsIntersect(this.canvasViewport.getBounds(), box.getBounds()) && box.getRadius() >= this.minRadius
  }

  preDraw (radius) {
    this.lineWidth = Math.ceil(this.widthOverRadius * radius)
    const strokeIntensity = 255 - clamp(0, 255, Math.round((radius - this.minRadius) / (this.minBlackRadius - this.minRadius) * 255))
    this.color = `rgb(${strokeIntensity},${strokeIntensity},${strokeIntensity})`

    this.canvasCtx.lineWidth = this.lineWidth
    this.canvasCtx.strokeStyle = this.color
    this.canvasCtx.fillStyle = this.color
  }

  drawVerticalLine (x, y, length) {
    x = Math.floor(x)
    y = Math.floor(y)
    length = Math.round(length)
    const widthRadius = Math.round(this.lineWidth / 2)

    this.canvasCtx.fillRect(x - widthRadius, y, this.lineWidth, length)
  }

  drawHorizontalLine (x, y, length) {
    x = Math.round(x)
    y = Math.round(y)
    length = Math.round(length)
    const widthRadius = Math.round(this.lineWidth / 2)

    this.canvasCtx.fillRect(x, y - widthRadius, length, this.lineWidth)
  }

  startStroke (box) {
    this.canvasCtx.beginPath()
  }

  endStroke (box) {
    this.canvasCtx.stroke()
  }
}
