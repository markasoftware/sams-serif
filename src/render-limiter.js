'use strict'

const Box = require('./box')

const clamp = (low, hi, mid) => mid > hi ? hi : mid < low ? low : mid

/**
 * Instances of this class will be passed to font letters while rendering.
 * It provides utility functions to the font, such as letting it know whether to render a certain item
 * and functions that prepare the canvas for drawing
 */
module.exports = class RenderLimiter {
  constructor (canvasCtx, canvasViewport, widthOverRadius, minRadius, minBlackRadius) {
    this.canvasCtx = canvasCtx
    this.canvasViewport = canvasViewport
    this.widthOverRadius = widthOverRadius
    this.minRadius = minRadius
    this.minBlackRadius = minBlackRadius
  }

  /**
   * Check if an element with a certain radius should be rendered
   * @param {number} radius
   * @returns {boolean} whether the radius is large enough to warrant rendering
   */
  shouldRenderRadius (radius) {
    return radius >= this.minRadius
  }

  /**
   * @param {number} radius
   * @returns {number} the width of the line for that radius
   */
  getWidthByRadius (radius) {
    return radius * this.widthOverRadius
  }

  /**
   * Checks if a box should be rendered. Checks if it is within the viewport *and* if it's radius is large enough
   * @param {Box} box to check
   * @returns {boolean}
   */
  shouldRender (box) {
    return Box.boundsIntersect(this.canvasViewport.getBounds(), box.getBounds()) && box.getRadius() >= this.minRadius
  }

  /**
   * Prepares a canvas for drawing. Should be run before doing any custom path stuff as well as
   * before draw{Vertical,Horizontal}Line
   * @param {radius} the radius of the thing that will be drawn, to determine color and width
   * @returns {null}
   */
  preDraw (radius) {
    this.lineWidth = Math.ceil(this.widthOverRadius * radius)
    const strokeIntensity = 255 - clamp(0, 255, Math.round((radius - this.minRadius) / (this.minBlackRadius - this.minRadius) * 255))
    this.color = `rgb(${strokeIntensity},${strokeIntensity},${strokeIntensity})`

    this.canvasCtx.lineWidth = this.lineWidth
    this.canvasCtx.strokeStyle = this.color
    this.canvasCtx.fillStyle = this.color
  }

  /**
   * Draw a vertical line. It will automatically round off numbers to improve performance and automatically sets width.
   * @param {number} x X coordinate of the line
   * @param {number} x Y coordinate of the top of the line
   * @param {number} length length of the line
   */
  drawVerticalLine (x, y, length) {
    x = Math.floor(x)
    y = Math.floor(y)
    length = Math.round(length)
    const widthRadius = Math.round(this.lineWidth / 2)

    this.canvasCtx.fillRect(x - widthRadius, y, this.lineWidth, length)
  }

  /**
   * Draw a horizontal line. It will automatically round off numbers to improve performance and automatically sets width.
   * @param {number} X coordinate of the left of the line
   * @param {number} Y coordinate of the line
   * @param {number} length of the line
   * @returns {null}
   */
  drawHorizontalLine (x, y, length) {
    x = Math.round(x)
    y = Math.round(y)
    length = Math.round(length)
    const widthRadius = Math.round(this.lineWidth / 2)

    this.canvasCtx.fillRect(x, y - widthRadius, length, this.lineWidth)
  }
}
