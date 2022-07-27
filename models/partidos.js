'use strict'

const moongose = require('mongoose')
const Schema = moongose.Schema

const AnalisisSchema = new Schema({
	id: {type: Number},
  fecha: {type: {type: String}},
	pais: {type: String},
  liga: {type: String},
  hora: {type: String},
  tiempo: {type: String},
  eq1: {type: String},
  eq2: {type: String},
  gol1: {type: Number},
  gol2: {type: Number},
  link: {type: String}
})

module.exports = moongose.model('partidos', AnalisisSchema)
