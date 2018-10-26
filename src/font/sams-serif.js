'use strict'

const Box = require('../box')

const samsSerif = opts => ({
  'I': {
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      // BEGIN CONFIGURATION
      const childWidthCoefficient = opts.IChildSize
      // END CONFIGURATION

      // scaling a box around the main I by this will make it contain all children.
      // This is because infinite sum x^(-n) = 1/(x-1)
      const addChildrenCoefficient = 1 / (1 / childWidthCoefficient - 1) + 1
      const dim = origBox.getDimensions()
      const bounds = origBox.getBounds()

      renderByCenter(bounds.x1 - dim.x / 2, bounds.y1 - dim.y / 2, dim.y / 2)

      function renderByCenter (x, y, verticalRadius) {
        const horizontalRadius = verticalRadius * opts.standardRatio
        const bounds = {
          x0: x - horizontalRadius,
          x1: x + horizontalRadius,
          y0: y - verticalRadius,
          y1: y + verticalRadius
        }
        const box = new Box(bounds)
        const boxWithChildren = new Box(bounds)
        boxWithChildren.scale(addChildrenCoefficient)

        if (!limiter.shouldRender(boxWithChildren)) {
          return
        }
        // draw children first so light colored stuff doesn't overdraw our rects
        const childVR = verticalRadius * childWidthCoefficient
        renderByCenter(bounds.x0, bounds.y0, childVR)
        renderByCenter(bounds.x1, bounds.y0, childVR)
        renderByCenter(bounds.x1, bounds.y1, childVR)
        renderByCenter(bounds.x0, bounds.y1, childVR)

        limiter.preDraw(box)
        limiter.drawHorizontalLine(bounds.x0, bounds.y0, bounds.x1 - bounds.x0)
        limiter.drawHorizontalLine(bounds.x0, bounds.y1, bounds.x1 - bounds.x0)
        limiter.drawVerticalLine(bounds.x0 + (bounds.x1 - bounds.x0) / 2, bounds.y0, bounds.y1 - bounds.y0)
      }
    }
  },

  // mostly a copy-paste from I
  'T': {
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      // BEGIN CONFIGURATION
      const childWidthCoefficient = opts.TChildSize
      // END CONFIGURATION

      // scaling a box around the main I by this will make it contain all children.
      // This is because infinite sum x^(-n) = 1/(x-1)
      const addChildrenCoefficient = 1 / (1 / childWidthCoefficient - 1) + 1
      const dim = origBox.getDimensions()
      const bounds = origBox.getBounds()

      renderByCenter(bounds.x1 - dim.x / 2, bounds.y1 - dim.y / 2, dim.y / 2)

      function renderByCenter (x, y, verticalRadius) {
        const horizontalRadius = verticalRadius * opts.standardRatio
        const bounds = {
          x0: x - horizontalRadius,
          x1: x + horizontalRadius,
          y0: y - verticalRadius,
          y1: y + verticalRadius
        }
        const box = new Box(bounds)
        const boxWithChildren = new Box(bounds)
        boxWithChildren.scale(addChildrenCoefficient)

        if (!limiter.shouldRender(boxWithChildren)) {
          return
        }
        // draw children first so light colored stuff doesn't overdraw our rects
        const childVR = verticalRadius * childWidthCoefficient
        renderByCenter(bounds.x0, bounds.y0, childVR)
        renderByCenter(bounds.x1, bounds.y0, childVR)

        limiter.preDraw(box)
        limiter.drawHorizontalLine(bounds.x0, bounds.y0, bounds.x1 - bounds.x0)
        limiter.drawVerticalLine(bounds.x0 + (bounds.x1 - bounds.x0) / 2, bounds.y0, bounds.y1 - bounds.y0)
      }
    }
  },

  'L': {
    ratio: opts.standardRatio,
    render: (ctx, origBox, limiter) => {
      const bounds = origBox.getBounds()
      const dim = origBox.getDimensions()
      const ratio = opts.standardRatio

      // vertical lines
      let curTop = bounds.y0
      let curLeft = bounds.x0
      let curLength = dim.y

      let shouldContinue = true
      for (let i = 0; shouldContinue; i = (i + 1) % 4) {
        switch (i) {
          // down is down
          case 0:
            renderSegment({ x0: curLeft, x1: curLeft + curLength, y0: curTop, y1: curTop + curLength }, true, curLeft, curTop)
            curTop += curLength
            break
          // right is down
          case 1:
            renderSegment({ x0: curLeft, x1: curLeft + curLength, y0: curTop - curLength, y1: curTop }, false, curLeft, curTop)
            curLeft += curLength
            break
          // up is down
          case 2:
            renderSegment({ x0: curLeft - curLength, x1: curLeft, y0: curTop - curLength, y1: curTop }, true, curLeft, curTop - curLength)
            curTop -= curLength
            break
          // left is down
          case 3:
            renderSegment({ x0: curLeft - curLength, x1: curLeft, y0: curTop, y1: curTop + curLength }, false, curLeft - curLength, curTop)
            curLeft -= curLength
            break
        }

        curLength *= 0.8
      }

      function renderSegment(bounds, isVertical, lineLeft, lineTop) {
        const box = new Box(bounds)
        if (!limiter.shouldRender(box)) {
          shouldContinue = false
          return
        }
        limiter.preDraw(box)
        const drawLine = isVertical ? limiter.drawVerticalLine.bind(limiter) : limiter.drawHorizontalLine.bind(limiter)
        drawLine(lineLeft, lineTop, curLength)
      }
    }
  }
})
module.exports = samsSerif
