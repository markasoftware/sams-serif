/**
 * The original purpose of the render limiter was to provide a way for the font to know what to and what not to render.
 * This is essential because otherwise the fonts do not know when to stop recursing. However, it has grown substantially
 * and now contains a number of drawing-related functions which aren't "limiting" whatsoever. The render limiter is now
 * essentially an anything-goes set of drawing and canvas related functionality.
 */

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

  /**
   * Draw an arc in the current path based on its points rather than angles
   * Converts stuff to polar then does shit
   *
   * @param {Point} the center of the arc
   * @param {Point} the start of the arc
   * @param {Point} the end of the arc
   */
  arcByPoints (center, start, end) {
    const centerCartesian = center.asCartesian()
    const startCartesian = start.asCartesian()
    const startPolar = start.asPolar()
    const endPolar = end.asPolar()

    this.canvasCtx.moveTo(startCartesian.x, startCartesian.y)
    this.canvasCtx.arc(
      centerCartesian.x,
      centerCartesian.y,
      startPolar.radius,
      startPolar.angle,
      endPolar.angle
    )
  }

  /**
  * The general procedure for a lot of these is three steps:
  * 1. Generate an array of all items to render
  * 2. Sort the array by radius to minimize the number of predraws
  * 3. Render each item in the array, predrawing if the radius is different than the last one
  *
  * All parameters are in the first argument object
  * @param find a function which takes (pushToMe) and appends all children, in whichever format the function prefers, to pushToMe
  * @param toRadius a function which takes a child item, in whichever format findChildren and renderChild use, and returns a radius for use in predraw
  * @param draw takes (child) and then renders it. Does not need to predraw. `render` property, in addition to whatever properties `find` created, will be present.
  * @return null
  */
  threePartRender (find, toRadius, draw) {
    const children = []
    find(children)
    console.log(`Rendering ${children.length} children`)
    let lastRadius = NaN
    for (const child of children) {
      child.radius = toRadius(child)
    }

    this.canvasCtx.beginPath()
    children
      .sort((a, b) => a.radius - b.radius)
      // foreach used to be a lot slower than a for loop but that is no longer the case
      .forEach(c => {
        // ideally we would zip arr $ tail arr then map to determine if different than last
        // but I'm not using ramda or lodash this time around and that's ok.
        // not to mention performance would be abominable
        const approxRadius = Math.floor(toRadius(c))
        if (approxRadius !== lastRadius) {
          lastRadius = approxRadius
          this.canvasCtx.stroke()
          this.canvasCtx.beginPath()
          this.preDraw(approxRadius)
        }

        draw(c)
      })
    this.canvasCtx.stroke()
  }
}
