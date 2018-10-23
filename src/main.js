'use strict'

const Panhandler = require('./panhandler')
const Renderer = require('./renderer')
const samsSerif = require('./fonts/sams-serif')

const canvasEl = document.getElementById('sams-canvas')
canvasEl.width = screen.availWidth
canvasEl.height = screen.availHeight
const canvasCtx = canvasEl.getContext('2d')

const pan = new Panhandler({ x0: 0, x1: 10, y0: 0, y1: 10 })
pan.linkEl(document.getElementById('bounded'))
