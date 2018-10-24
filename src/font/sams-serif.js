'use strict'

const Box = require('../box')

const samsSerif = {
  'I': {
    ratio: 0.7,
    render: (ctx, origBox, limiter) => {
      // BEGIN CONFIGURATION
      const childWidthCoefficient = 0.4
      // END CONFIGURATION

      // scaling a box around the main I by this will make it contain all children.
      // This is because infinite sum x^(-n) = 1/(x-1)
      const addChildrenCoefficient = 1/(1/childWidthCoefficient - 1) + 1
      const dim = origBox.getDimensions()
      const bounds = origBox.getBounds()

      renderByCenter(bounds.x1 - dim.x / 2, bounds.y1 - dim.y / 2, dim.y / 2)

      function renderByCenter(x, y, verticalRadius) {
        const horizontalRadius = verticalRadius * samsSerif.I.ratio
        const bounds = {
          x0: x - horizontalRadius,
          x1: x + horizontalRadius,
          y0: y - verticalRadius,
          y1: y + verticalRadius,
        }
        const box = new Box(bounds)
        const boxWithChildren = new Box(bounds)
        boxWithChildren.scale(addChildrenCoefficient)

        if (!limiter.shouldRender(boxWithChildren)) {
          return
        }
        limiter.setupStroke(box)
        ctx.moveTo(bounds.x0, bounds.y0)
        ctx.lineTo(bounds.x1, bounds.y0)
        ctx.moveTo(bounds.x0 + (bounds.x1 - bounds.x0) / 2, bounds.y0)
        ctx.lineTo(bounds.x0 + (bounds.x1 - bounds.x0) / 2, bounds.y1)
        ctx.moveTo(bounds.x0, bounds.y1)
        ctx.lineTo(bounds.x1, bounds.y1)
        limiter.endStroke()

        const childVR = verticalRadius * childWidthCoefficient
        renderByCenter(bounds.x0, bounds.y0, childVR)
        renderByCenter(bounds.x1, bounds.y0, childVR)
        renderByCenter(bounds.x1, bounds.y1, childVR)
        renderByCenter(bounds.x0, bounds.y1, childVR)
      }
    }
  }
}
module.exports = samsSerif
