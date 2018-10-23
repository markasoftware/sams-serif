'use strict'

const R = require('ramda')
const Box = require('./box')

module.exports = class Renderer {
  static render (font, text, canvasCtx, canvasViewport, origViewport, optsArg = {}) {
    const opts = Object.assign({
      horizontalSpacing: 100,
      verticalSpacing: 100,
      widthOverRadius: 0.05,
      minBlackRadius: 150,
      textHeight: 250,
      minRadius: 10
    }, optsArg)

    this._resetCanvas(canvasCtx)

    let curLeft = origViewport.getBounds().x0
    let curTop = origViewport.getBounds().y0

    text.split('').forEach(char => {
      const fontChar = font[char]
      if (!fontChar) {
        return
      }

      const charWidth = this._renderChar(opts, char, fontChar, canvasCtx, canvasViewport, curLeft, curTop)

      curLeft += charWidth + opts.horizontalSpacing
    })

    this._closeCanvas(canvasCtx)
  }

  static _resetCanvas (ctx) {
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
    ctx.beginPath()
  }

  static _closeCanvas (ctx) {
    ctx.stroke()
  }

  // @return width of character
  static _renderChar (opts, char, fontChar, canvasCtx, canvasViewport, x0, y0) {
    const charWidth = opts.textHeight * fontChar.ratio
    const charBox = new Box({ x0, y0, x1: x0 + charWidth, y1: y0 + opts.textHeight })

    fontChar.render(canvasCtx, charBox, R.curry(this._wrapDraw)(opts, canvasCtx, canvasViewport))

    return charWidth
  }

  static _wrapDraw (opts, canvasCtx, canvasViewport, box, drawer) {
    if (!Box.boundsIntersect(box.getBounds(), canvasViewport.getBounds()) || box.getRadius() <= opts.minRadius) {
      return
    }

    const oldLineWidth = canvasCtx.lineWidth
    const oldStrokeStyle = canvasCtx.strokeStyle

    canvasCtx.lineWidth = opts.widthOverRadius * box.getRadius()
    const strokeIntensity = R.clamp(0, 255, Math.round((box.getRadius() - opts.minRadius) / (opts.minBlackRadius - opts.minRadius) * 255))
    canvasCtx.strokeStyle = `rgb(${strokeIntensity}, ${strokeIntensity}, ${strokeIntensity})`

    drawer()

    canvasCtx.lineWidth = oldLineWidth
    canvasCtx.strokeStyle = oldStrokeStyle
  }
}
