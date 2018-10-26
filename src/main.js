'use strict'

const Controller = require('./controller')
const samsSerif = require('./font/sams-serif')

const canvasEl = document.getElementById('sams_canvas')
const dragEl = canvasEl

const ctl = new Controller(canvasEl, dragEl, document.body, document.body, samsSerif)
ctl.link()
