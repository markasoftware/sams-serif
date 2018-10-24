'use strict'

const R = require('ramda')
const Box = require('./box')
const RenderLimiter = require('./render-limiter')

module.exports = class Renderer {
  constructor (font, text, canvasCtx, canvasViewport, origViewport, optsArg = {}) {
    this.font = font
    this.text = text
    this.canvasViewport = canvasViewport
    this.origViewport = origViewport
    this.canvasCtx = canvasCtx
    Object.assign(this, {
      horizontalSpacing: 100,
      verticalSpacing: 100,
      widthOverRadius: 0.05,
      minBlackRadius: 150,
      textHeight: 250,
      minRadius: 10
    }, optsArg)
  }

  render () {
    this._resetCanvas()

    let curLeft = this.origViewport.getBounds().x0
    let curTop = this.origViewport.getBounds().y0

    this.text.split('').forEach(char => {
      const charWidth = this._renderChar(char, curLeft, curTop)

      curLeft += charWidth + this.horizontalSpacing
    })

    this._closeCanvas()
  }

  _resetCanvas () {
    const { x1, y1 } = this.canvasViewport.getBounds()
    this.canvasCtx.clearRect(0, 0, x1, y1)
    this.canvasCtx.beginPath()
  }

  _closeCanvas () {
    this.canvasCtx.stroke()
  }

  // @return width of character
  _renderChar (char, x0, y0) {
    const fontChar = this.font[char]
    if (!fontChar) {
      return
    }
    const charWidth = this.textHeight * fontChar.ratio
    const charBox = new Box({ x0, y0, x1: x0 + charWidth, y1: y0 + this.textHeight })

    const renderLimiter = new RenderLimiter(this.canvasCtx, this.canvasViewport, this.widthOverRadius, this.minRadius, this.minBlackRadius)

    fontChar.render(this.canvasCtx, charBox, renderLimiter)

    return charWidth
  }
}
