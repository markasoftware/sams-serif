'use strict'

const Controller = require('./controller')
const samsSerif = require('./font/sams-serif')

const canvasEl = document.getElementById('sams_canvas')
const dragEl = canvasEl
const keyEl = document.body

const ctl = new Controller(canvasEl, dragEl, keyEl, samsSerif)
ctl.link()
