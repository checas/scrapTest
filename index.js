const express = require('express');
const app = express();
const mongoose = require('mongoose');

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { html } = require('cheerio/lib/api/manipulation');

const partidoSchema = require('./models/partidos')

const getRawData = (URL) => {
	return fetch(URL)
		.then((response) => response.text())
		.then((data) => {
			return data;
		});
};

app.get('/score', async function (req, res) {
	const url = 'https://www.promiedos.com.ar/ficha=xjxjgktsqz'
	let fallo = false
	let respuesta={
		equipo1: null,
		equipo2: null,
		tiempo: null,
		goles1: null,
		goles2: null,
		estadio: null,
		arbitro: null
	}
	try {
		const dataHtml = await getRawData(url)
		const $ = cheerio.load(dataHtml)
		let tabla1 = $('#formacion1 tbody tr').toArray()
		respuesta.equipo1 = $(tabla1[0]).text()
		let tabla2 = $('#formacion2 tbody tr').toArray()
		respuesta.equipo2 = $(tabla2[0]).text()
		try {
			respuesta.tiempo = $('#ficha-tiempo').text()
		}catch(err){
			respuesta.tiempo = 'No inició'
		}
		if(!respuesta.tiempo.includes('No inció') || respuesta.tiempo === '') {
			respuesta.goles1 = $('#ficha-resultado1').text()
			respuesta.goles2 = $('#ficha-resultado2').text()
			let ref = $('#ficha-horario').find('span').toArray()
			respuesta.arbitro = $(ref[1]).text()
			let est = []
			est = $(ref[0]).text().split(' ')
			respuesta.estadio = est[1]
		}

		
	}catch (err) {
		fallo = true
		console.log(err)
	}finally{
		if (!fallo) {
			res.status(200).send(respuesta);
		} else {
			res.status(500).send('Error al scrapear datos equipo 1');
		}
	}
})

app.get('/notifications', async function (req, res) {
	const url = 'https://www.promiedos.com.ar/ficha=xjxjgxjpnskt'
	let fallo = false
	let respuesta={
		equipo1: {
			nombre: null,
			tarjetasAmarillas: [],
			tarjetasRojas: [],
			goles: [],
			cambios: [],
			incidencias: []
		},
		equipo2: {
			nombre: null,
			tarjetasAmarillas: [],
			tarjetasRojas: [],
			goles: [],
			cambios: [],
			incidencias: []
		},
		estadisticas: {
			posesion: [],
			tirosAlArcoEf: [],
			tirosAlArcoInt: [],
			fouls:[],
			corners :[]
		}
	}
	try {
		const dataHtml = await getRawData(url)
		const $ = cheerio.load(dataHtml)
		//equipo 1
		let tabla1 = $('#formacion1 tbody tr').toArray()
		respuesta.equipo1.nombre = $(tabla1[0]).text()
		let proxGol = false
		let proxAmar = false
		let proxRoj = false
		let proxCamb = false
		let proxInci = false
		for(let row of tabla1){
			if(proxGol) {
				respuesta.equipo1.goles = $(row).text()
				proxGol = false
			}
			if(proxAmar){
				respuesta.equipo1.tarjetasAmarillas = $(row).text()
				proxAmar = false
			}
			if(proxRoj){
				respuesta.equipo1.tarjetasRojas = $(row).text()
				proxRoj = false
			}
			if(proxCamb){
				respuesta.equipo1.cambios = $(row).text()
				proxCamb = false
			}
			if(proxInci){
				respuesta.equipo1.incidencias = $(row).text()
				proxInci = false
			}
			let tit = $(row).text()
			if(tit != null){
				if(tit.includes('GOLES')){
					proxGol = true
				} else if(tit.includes('AMARILLAS')){
					proxAmar = true
				} else if(tit.includes('ROJAS')){
					proxRoj = true
				} else if(tit.includes('CAMBIOS')){
					proxCamb = true
				} else if(tit.includes('INCIDENCIAS')){
					proxInci = true
				}
			}
		}
		//equipo 2
		let tabla2 = $('#formacion2 tbody tr').toArray()
		respuesta.equipo2.nombre = $(tabla2[0]).text()
		proxGol = false
		proxAmar = false
		proxRoj = false
		proxCamb = false
		proxInci = false
		for(let row of tabla2){
			if(proxGol) {
				respuesta.equipo2.goles = $(row).text()
				proxGol = false
			}
			if(proxAmar){
				respuesta.equipo2.tarjetasAmarillas = $(row).text()
				proxAmar = false
			}
			if(proxRoj){
				respuesta.equipo2.tarjetasRojas = $(row).text()
				proxRoj = false
			}
			if(proxCamb){
				respuesta.equipo2.cambios = $(row).text()
				proxCamb = false
			}
			if(proxInci){
				respuesta.equipo2.incidencias = $(row).text()
				proxInci = false
			}
			let tit = $(row).text()
			if(tit != null){
				if(tit.includes('GOLES')){
					proxGol = true
				} else if(tit.includes('AMARILLAS')){
					proxAmar = true
				} else if(tit.includes('ROJAS')){
					proxRoj = true
				} else if(tit.includes('CAMBIOS')){
					proxCamb = true
				} else if(tit.includes('INCIDENCIAS')){
					proxInci = true
				}
			}
		}
	}catch (err) {
		fallo = true
		console.log(err)
	}finally{
		if (!fallo) {
			res.status(200).send(respuesta);
		} else {
			res.status(500).send('Error notifications');
		}
	}
})
app.get('/team/1', async function (req, res) {
	const url = 'https://www.promiedos.com.ar/ficha=xjxjgxjpnskt'
	let fallo = false
	let respuesta={
		equipo:null,
		titulares:[],
		suplentes: [],
		dt: null
	}
	try {
		const dataHtml = await getRawData(url)
		const $ = cheerio.load(dataHtml)
		let tabla = $('#formacion1 tbody tr').toArray()
		respuesta.equipo = $(tabla[0]).text()
		let i = 0
		for(let filas of tabla){
			if(i >= 3 && i <= 13){
				let jug = $(filas).find('td').toArray()
				let jugador = {
					pos: $(jug[0]).text(),
					numero: $(jug[1]).text(),
					nombre: $(jug[2]).text(),
					edad: $(jug[3]).text(),
					altura: $(jug[4]).text(),
				}
				respuesta.titulares.push(jugador)
				
			}
			if(i == 14) {
				let d = $(filas).find('td').toArray()
				respuesta.dt = $(d[1]).text()
			}
			if(i >= 17 ){
				let jug = $(filas).find('td').toArray()
				if(jug.length == 5) {
					let jugador = {
						pos: $(jug[0]).text(),
						numero: $(jug[1]).text(),
						nombre: $(jug[2]).text(),
						edad: $(jug[3]).text(),
						altura: $(jug[4]).text(),
					}
					respuesta.suplentes.push(jugador)
				}
			}
			i++	
		}
		console.log(`Titulares: ${respuesta.titulares.length}`)
		console.log(`Suplentes: ${respuesta.suplentes.length}`)
	}catch (err) {
		fallo = true
		console.log(err)
	}finally{
		if (!fallo) {
			res.status(200).send(respuesta);
		} else {
			res.status(500).send('Error al scrapear datos equipo 1');
		}
	}
})
app.get('/team/2', async function (req, res) {
	const url = 'https://www.promiedos.com.ar/ficha=xjxjgxjpnskt'
	let fallo = false
	let respuesta={
		equipo:null,
		titulares:[],
		suplentes: [],
		dt: null
	}
	try {
		const dataHtml = await getRawData(url)
		const $ = cheerio.load(dataHtml)
		let tabla = $('#formacion2 tbody tr').toArray()
		respuesta.equipo = $(tabla[0]).text()
		let i = 0
		for(let filas of tabla){
			if(i >= 3 && i <= 13){
				let jug = $(filas).find('td').toArray()
				let jugador = {
					pos: $(jug[0]).text(),
					numero: $(jug[1]).text(),
					nombre: $(jug[2]).text(),
					edad: $(jug[3]).text(),
					altura: $(jug[4]).text(),
				}
				respuesta.titulares.push(jugador)
				
			}
			if(i == 14) {
				let d = $(filas).find('td').toArray()
				respuesta.dt = $(d[1]).text()
			}
			if(i >= 17 ){
				let jug = $(filas).find('td').toArray()
				if(jug.length == 5) {
					let jugador = {
						pos: $(jug[0]).text(),
						numero: $(jug[1]).text(),
						nombre: $(jug[2]).text(),
						edad: $(jug[3]).text(),
						altura: $(jug[4]).text(),
					}
					respuesta.suplentes.push(jugador)
				}
			}
			i++	
		}
		console.log(`Titulares: ${respuesta.titulares.length}`)
		console.log(`Suplentes: ${respuesta.suplentes.length}`)
	}catch (err) {
		fallo = true
		console.log(err)
	}finally{
		if (!fallo) {
			res.status(200).send(respuesta);
		} else {
			res.status(500).send('Error al scrapear datos equipo 1');
		}
	}
})
app.get('/stadistics', async function (req, res) {
	const url = 'https://www.promiedos.com.ar/ficha=xjxjgxjpnskt&v=BRhtiW9n4Jg'
	let fallo = false
	let respuesta={
		posesion: [],
		tirosAlArcoEf: [],
		tirosAlArcoInt: [],
		fouls:[],
		corners :[]
	}
	try {
		const dataHtml = await getRawData(url)
		const $ = cheerio.load(dataHtml)
		let est = $('#ficha-estadisticas').find('div').toArray()
		console.log(est.length)
		
		respuesta.posesion.push($(est[5]).text())
		respuesta.posesion.push($(est[6]).text())

		respuesta.tirosAlArcoEf.push($(est[8]).text())
		respuesta.tirosAlArcoEf.push($(est[9]).text())

		respuesta.tirosAlArcoInt.push($(est[11]).text())
		respuesta.tirosAlArcoInt.push($(est[12]).text())

		respuesta.fouls.push($(est[14]).text())
		respuesta.fouls.push($(est[15]).text())

		respuesta.corners.push($(est[17]).text())
		respuesta.corners.push($(est[18]).text())
		
	}catch (err) {
		fallo = true
		console.log(err)
	}finally{
		if (!fallo) {
			res.status(200).send(respuesta);
		} else {
			res.status(500).send('Error al scrapear datos equipo 1');
		}
	}
})

app.get('/grupos', async function (req, res, next) {
	const url = 'https://www.promiedos.com.ar/mundial';
	let fallo = false;
	let respuesta = {
		
	};
	try {
		const dataHtml = await getRawData(url);
		const $ = cheerio.load(dataHtml);
		let grupos = $('div.grupo').toArray();
		let grup = {
			grupo: null,
		};
		for (let gru of grupos) {
			grup.grupo = $(gru).find('div.titulotabla2').text().substring(6, 7);
		}
	} catch (e) {
		fallo = true;
	} finally {
		if (!fallo) {
			res.status(200).send(respuesta);
		} else {
			res.status(500).send(':(');
		}
	}
});

app.get('/hoy', async function (req, res) {
	const url = 'https://www.promiedos.com.ar';
	let fallo = false;
	let respuesta = {
		fecha: null,
		partidos: [],
	};
	try {
		const dataHtml = await getRawData(url);
		const $ = cheerio.load(dataHtml);
		let fixture = $('#fixturein').toArray();
		respuesta.fecha = $('#cajadia2 > span.titucuadros').text();
		respuesta.fecha = respuesta.fecha.substring(4);
		console.log(`Cant fix: ${fixture.length}`)
		let j = 0
		for (let fix of fixture) {
			j++
			/*
			if(j== 5){
				console.log($(fix).html())
			}
			*/
			let partido = {
				liga: null,
				pais: null,
				partido: [],
			};
			partido.liga = $(fix).find('tr.tituloin a').text();
			paisAux = $(fix).find('tr.tituloin a img').attr('src');
			let parsePais = paisAux.split('/');
			parsePais = parsePais[2].split('.');
			partido.pais = parsePais[0];

			let tabla = $(fix).find('tbody tr').toArray();

			i = 0;
			for (let tr of tabla) {
				let p = {
					hora: null,
					tiempo: null,
					eq1: null,
					eq2: null,
					eq1G: null,
					eq2G: null,
					linkDetalle: null
				};
				let td = $(tr).find('td').toArray()
				//console.log(`Cantidad de td: ${td.length}`)
				//if (i % 2 == 0 && i != 0) {
				if (td.length == 6 && i != 0) {
					p.tiempo = $(tr).find('td.game-play').text();
					p.hora = $(tr).find('td.game-time').text();
					let eq = $(tr).find('td.game-t1').toArray();
					p.eq1G = $(tr).find('td.game-r1').text();
					p.eq2G = $(tr).find('td.game-r2').text();
					let href = String($(tr).find('td.game-info a').attr('href'))
					if(href.includes('ficha')){
						p.linkDetalle = href
					}
					for (let e of eq) {
						if (p.eq1 == null) {
							p.eq1 = $(e).text();
						} else {
							p.eq2 = $(e).text();
						}
					}
					partido.partido.push(p);
				}
				i++;
			}
			respuesta.partidos.push(partido);
		}
	} catch (e) {
		fallo = true;
		console.log(e);
	} finally {
		if (!fallo) {
			await saveDB(respuesta)
			res.status(200).send(respuesta);
		} else {
			res.status(500).send(':(');
		}
	}
});

app.get('/minuto', async function (req, res){
	let fallo = false
	let respuesta = []
	let dataDB = null
	try {
		dataDB = await readDB(1)
		let url  = 'https://www.promiedos.com.ar/' + dataDB.partidos[4].partido[0].linkDetalle
		const dataHtml = await getRawData(url)
		const $ = cheerio.load(dataHtml)
		let score = {
			tiempo: null,
			goles1: null,
			goles2: null,
		}
		let stadistics = {
			posesion: [],
			tirosAlArcoEf: [],
			tirosAlArcoInt: [],
			fouls: [],
			corners: []
		}
		let notifications={
			equipo1: {
				nombre: null,
				tarjetasAmarillas: [],
				tarjetasRojas: [],
				goles: [],
				cambios: [],
				incidencias: []
			},
			equipo2: {
				nombre: null,
				tarjetasAmarillas: [],
				tarjetasRojas: [],
				goles: [],
				cambios: [],
				incidencias: []
			}
		}

		//score
		try {
			score.tiempo = $('#ficha-tiempo').text()
		}catch(err){
			score.tiempo = 'No inició'
		}
		if(!score.tiempo.includes('No inció') || score.tiempo === '') {
			score.goles1 = $('#ficha-resultado1').text()
			score.goles2 = $('#ficha-resultado2').text()
		}
		//stadistics
		let est = $('#ficha-estadisticas').find('div').toArray()
		stadistics.posesion.push($(est[5]).text())
		stadistics.posesion.push($(est[6]).text())

		stadistics.tirosAlArcoEf.push($(est[8]).text())
		stadistics.tirosAlArcoEf.push($(est[9]).text())

		stadistics.tirosAlArcoInt.push($(est[11]).text())
		stadistics.tirosAlArcoInt.push($(est[12]).text())

		stadistics.fouls.push($(est[14]).text())
		stadistics.fouls.push($(est[15]).text())

		stadistics.corners.push($(est[17]).text())
		stadistics.corners.push($(est[18]).text())

		//notificaions
		let tabla1 = $('#formacion1 tbody tr').toArray()
		notifications.equipo1.nombre = $(tabla1[0]).text()
		let proxGol = false
		let proxAmar = false
		let proxRoj = false
		let proxCamb = false
		let proxInci = false
		for(let row of tabla1){
			if(proxGol) {
				notifications.equipo1.goles = $(row).text()
				proxGol = false
			}
			if(proxAmar){
				notifications.equipo1.tarjetasAmarillas = $(row).text()
				proxAmar = false
			}
			if(proxRoj){
				notifications.equipo1.tarjetasRojas = $(row).text()
				proxRoj = false
			}
			if(proxCamb){
				notifications.equipo1.cambios = $(row).text()
				proxCamb = false
			}
			if(proxInci){
				notifications.equipo1.incidencias = $(row).text()
				proxInci = false
			}
			let tit = $(row).text()
			if(tit != null){
				if(tit.includes('GOLES')){
					proxGol = true
				} else if(tit.includes('AMARILLAS')){
					proxAmar = true
				} else if(tit.includes('ROJAS')){
					proxRoj = true
				} else if(tit.includes('CAMBIOS')){
					proxCamb = true
				} else if(tit.includes('INCIDENCIAS')){
					proxInci = true
				}
			}
		}
		//equipo 2
		let tabla2 = $('#formacion2 tbody tr').toArray()
		notifications.equipo2.nombre = $(tabla2[0]).text()
		proxGol = false
		proxAmar = false
		proxRoj = false
		proxCamb = false
		proxInci = false
		for(let row of tabla2){
			if(proxGol) {
				notifications.equipo2.goles = $(row).text()
				proxGol = false
			}
			if(proxAmar){
				notifications.equipo2.tarjetasAmarillas = $(row).text()
				proxAmar = false
			}
			if(proxRoj){
				notifications.equipo2.tarjetasRojas = $(row).text()
				proxRoj = false
			}
			if(proxCamb){
				notifications.equipo2.cambios = $(row).text()
				proxCamb = false
			}
			if(proxInci){
				notifications.equipo2.incidencias = $(row).text()
				proxInci = false
			}
			let tit = $(row).text()
			if(tit != null){
				if(tit.includes('GOLES')){
					proxGol = true
				} else if(tit.includes('AMARILLAS')){
					proxAmar = true
				} else if(tit.includes('ROJAS')){
					proxRoj = true
				} else if(tit.includes('CAMBIOS')){
					proxCamb = true
				} else if(tit.includes('INCIDENCIAS')){
					proxInci = true
				}
			}
		}
		
		let auxPartido = {
			hora: dataDB.partidos[4].partido[0].hora,
			tiempo: score.tiempo,
			eq1: dataDB.partidos[4].partido[0].eq1,
			eq2: dataDB.partidos[4].partido[0].eq2,
			linkDetalle: dataDB.partidos[4].partido[0].linkDetalle,
			formacion1: dataDB.partidos[4].partido[0].formacion1,
			formacion2: dataDB.partidos[4].partido[0].formacion2,
			stadisitics: stadistics,
			notifications: notifications,
			goles1: score.goles1,
			goles2: score.goles2,
	}
		dataDB.partidos[4].partido[0] = auxPartido
		respuesta = score.tiempo

	} catch(err){
		fallo = true
		console.log(err)
	} finally {
		if (!fallo) {
			await saveDB(dataDB)
			res.status(200).send(respuesta);
		} else {
			res.status(500).send(':(');
		}
	}
})

app.get('/test', async function(req, res, next){
	//lee db
	let fallo = false
	let respuesta = []
	let dataDB = null
	try {
		dataDB = await readDB(1)
		let url  = 'https://www.promiedos.com.ar/' + dataDB.partidos[4].partido[0].linkDetalle
		let eq1 ={
			equipo:null,
			titulares:[],
			suplentes: [],
			dt: null
		}
		let eq2={
			equipo:null,
			titulares:[],
			suplentes: [],
			dt: null
		}
		const dataHtml = await getRawData(url)
		const $ = cheerio.load(dataHtml)
		let tabla = $('#formacion1 tbody tr').toArray()
		eq1.equipo = $(tabla[0]).text()
		let i = 0
		for(let filas of tabla){
			if(i >= 3 && i <= 13){
				let jug = $(filas).find('td').toArray()
				let jugador = {
					pos: $(jug[0]).text(),
					numero: $(jug[1]).text(),
					nombre: $(jug[2]).text(),
					edad: $(jug[3]).text(),
					altura: $(jug[4]).text(),
				}
				eq1.titulares.push(jugador)
				
			}
			if(i == 14) {
				let d = $(filas).find('td').toArray()
				eq1.dt = $(d[1]).text()
			}
			if(i >= 17 ){
				let jug = $(filas).find('td').toArray()
				if(jug.length == 5) {
					let jugador = {
						pos: $(jug[0]).text(),
						numero: $(jug[1]).text(),
						nombre: $(jug[2]).text(),
						edad: $(jug[3]).text(),
						altura: $(jug[4]).text(),
					}
					eq1.suplentes.push(jugador)
				}
			}
			i++	
		}
		i=0
		let tabla2 = $('#formacion1 tbody tr').toArray()
		eq2.equipo = $(tabla[0]).text()
		
		for(let filas of tabla2){
			if(i >= 3 && i <= 13){
				let jug = $(filas).find('td').toArray()
				let jugador = {
					pos: $(jug[0]).text(),
					numero: $(jug[1]).text(),
					nombre: $(jug[2]).text(),
					edad: $(jug[3]).text(),
					altura: $(jug[4]).text(),
				}
				eq2.titulares.push(jugador)
				
			}
			if(i == 14) {
				let d = $(filas).find('td').toArray()
				eq2.dt = $(d[1]).text()
			}
			if(i >= 17 ){
				let jug = $(filas).find('td').toArray()
				if(jug.length == 5) {
					let jugador = {
						pos: $(jug[0]).text(),
						numero: $(jug[1]).text(),
						nombre: $(jug[2]).text(),
						edad: $(jug[3]).text(),
						altura: $(jug[4]).text(),
					}
					eq2.suplentes.push(jugador)
				}
			}
			i++	
		}
		let auxPartido = {
			hora: dataDB.partidos[4].partido[0].hora,
			tiempo: dataDB.partidos[4].partido[0].tiempo,
			eq1: dataDB.partidos[4].partido[0].eq1,
			eq2: dataDB.partidos[4].partido[0].eq2,
			linkDetalle: dataDB.partidos[4].partido[0].linkDetalle,
			formacion1: eq1,
			formacion2: eq2
		}
		dataDB.partidos[4].partido[0] = auxPartido
		
	} catch(err){
		fallo = true
		console.log(err)
	} finally {
		if (!fallo) {
			await saveDB(dataDB)
			res.status(200).send(respuesta);
		} else {
			res.status(500).send(':(');
		}
	}
})

app.get('/base', async function(req,res){
	let cantidadDB = await cantDocDB()

	console.time('scrap')
  const url = 'https://www.promiedos.com.ar/ayer';
	let fallo = false;
  let respuesta2 = []
	let respuesta = {
		fecha: null,
		partidos: [],
	};
	let id = cantidadDB
	try {
		const dataHtml = await getRawData(url);
		const $ = cheerio.load(dataHtml);
		let fixture = $('#fixturein').toArray();
		respuesta.fecha = $('#cajadia2 > span.titucuadros').text();
		respuesta.fecha = respuesta.fecha.substring(4);
		console.log(`Cant fix: ${fixture.length}`)
		let j = 0
		for (let fix of fixture) {
			j++
			let partido = {
				liga: null,
				pais: null,
				partido: [],
			};
			partido.liga = $(fix).find('tr.tituloin a').text();
			paisAux = $(fix).find('tr.tituloin a img').attr('src');
			let parsePais = paisAux.split('/');
			parsePais = parsePais[2].split('.');
			partido.pais = parsePais[0];

			let tabla = $(fix).find('tbody tr').toArray();

			i = 0;
			for (let tr of tabla) {
        let p = {
					indice: id,
          fecha: respuesta.fecha,
          liga: partido.liga,
          pais: partido.pais,
					hora: null,
					tiempo: null,
					eq1: null,
					eq2: null,
					eq1G: null,
					eq2G: null,
					linkDetalle: null
				};
				let td = $(tr).find('td').toArray()
				if (td.length == 6 && i != 0) {
					p.tiempo = $(tr).find('td.game-play').text();
					p.hora = $(tr).find('td.game-time').text();
					let eq = $(tr).find('td.game-t1').toArray();
					p.eq1G = $(tr).find('td.game-r1').text();
					p.eq2G = $(tr).find('td.game-r2').text();
					let href = String($(tr).find('td.game-info a').attr('href'))
					if(href.includes('ficha')){
						p.linkDetalle = href
					}
					for (let e of eq) {
						if (p.eq1 == null) {
							p.eq1 = $(e).text();
						} else {
							p.eq2 = $(e).text();
						}
					}
          respuesta2.push(p)
					id++
					try{
						await saveDB2(p)
					}catch(e){
						console.log('fallo algo al grabar db')
						console.log(e)
					}
				}
				i++;
			}
			respuesta.partidos.push(partido);	
		}
	} catch (e) {
		fallo = true;
		console.log(e);
	} finally {
		if (!fallo) {
			res.status(200).send(respuesta2);
			console.timeEnd('scrap')
		} else {
			res.status(500).send(':(');
		}
	}
})

app.get('/update', async function(req,res){
	console.time('scrapUpdate')
	const url = 'https://www.promiedos.com.ar/ayer';
	let fallo = false;
	let respuesta = []
	try {
		const dataHtml = await getRawData(url);
		const $ = cheerio.load(dataHtml);
		let fecha = $('#cajadia2 > span.titucuadros').text();
		fecha = fecha.substring(4);
		fecha = "Lunes 09 de Mayo de 2022"
		let dataDB = await partidoSchema.find({fecha: fecha})
		let fixture = $('#fixturein').toArray();
		let j = 0
		let respuesta2 = []
		for(let fix of fixture){
			j++
			let partido = {
				liga: null,
				pais: null,
				partido: [],
			};

			let tabla = $(fix).find('tbody tr').toArray();

			i = 0;
		
			//let id = dataDB[0].id
			let id = 0
			for (let tr of tabla) {
        let p = {
					indice: id,
          fecha: fecha.fecha,
          liga: partido.liga,
          pais: partido.pais,
					hora: null,
					tiempo: null,
					eq1: null,
					eq2: null,
					eq1G: null,
					eq2G: null,
					linkDetalle: null
				};
				let td = $(tr).find('td').toArray()
				if (td.length == 6 && i != 0) {
					p.tiempo = $(tr).find('td.game-play').text();
					if(p.tiempo ==="") {
						p.tiempo = $(tr).find('td.game-fin').text();
					}
					
					let eq = $(tr).find('td.game-t1').toArray();
					p.eq1G = $(tr).find('td.game-r1').text();
					p.eq2G = $(tr).find('td.game-r2').text();
					let href = String($(tr).find('td.game-info a').attr('href'))
					if(href.includes('ficha')){
						p.linkDetalle = href
					}
					for (let e of eq) {
						if (p.eq1 == null) {
							p.eq1 = $(e).text();
						} else {
							p.eq2 = $(e).text();
						}
					}
          respuesta2.push(p)
					id++
				}
				i++;
			}
		}
		
		console.log(dataDB.length)
		
		console.log(respuesta2.length)
		
		i = 0
		for(let dat of dataDB){
			try {
				dat.gol1 = respuesta2[i].eq1G
				dat.gol2 = respuesta2[i].eq2G
				dat.tiempo = respuesta2[i].tiempo
				dat.link = respuesta2[i].linkDetalle
				await saveDB2(dat)
				respuesta.push(dat)
				
			}catch (err) {
				console.log(i,err)
			}
			i++
		}
	}catch(e){
		fallo = true
		console.log(e)
	} finally {
		if (!fallo) {
			res.status(200).send(respuesta);
			console.timeEnd('scrapUpdate')
		} else {
			res.status(500).send(':(');
		}
	}
})

async function cantDocDB(){
	let doc = await partidoSchema.find({})
	return doc.length
}

async function readDB(fecha){
	return await partidoSchema.find({fecha: fecha})
}

async function readDB(id){
	return partidoSchema.findOne({id: id}, function (err, result){
		if(!err){
			return result
		} else {
			throw err
		}
	})
	.clone()
	.catch(function(err){
		return null
	})
}

async function saveDB(data) {
	const filter = {id: 1}
	const update = {
		fecha: data.fecha,
		partidos: data.partidos
	}
	await partidoSchema.countDocuments(filter, update);
	let doc = await partidoSchema.findOneAndUpdate(filter, update, {
		new: true,
		upsert: true
	}) 
}

async function saveDB2(data) {
	console.log(data)
	const filter = {id: data.indice}
	
	const update = {
		id: data.indice,
		fecha: data.fecha,
		liga: data.liga,
    pais: data.pais,
    hora: data.hora,
    tiempo: data.tiempo,
    eq1: data.eq1,
    eq2: data.eq2,
    gol1: data.eq1G,
    gol2: data.eq2G,
    link: data.linkDetalle
	}
	await partidoSchema.countDocuments(filter, update);
	let doc = await partidoSchema.findOneAndUpdate(filter, update, {
		new: true,
		upsert: true
	}) 
}

mongoose.connect('mongodb://localhost:27017/futbol', (err, res) => {
	if(err) {
			return console.log(`Error al conectar con la base de datos: ${err}`)
	}
	console.log('Conexión con base de datos establecida...')
	app.listen(3000, () => {
			console.log(`API SEO corriendo en http://localhost:${3000}`);
	});
});
/*
app.listen(3000, () => {
	console.log('El servidor está inicializado en el puerto 3000');
});
*/
