const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { html } = require('cheerio/lib/api/manipulation');

// function to get the raw data
const getRawData = (URL) => {
	return fetch(URL)
		.then((response) => response.text())
		.then((data) => {
			return data;
		});
};

const url = 'https://www.promiedos.com.ar';

const getData = async () => {
	const dataHtml = await getRawData(url);
	const $ = cheerio.load(dataHtml);
	let fixture = $('#fixturein').toArray();
	let fecha = $('#cajadia2 > span.titucuadros').text();
	let partidos = [];

	for (let fix of fixture) {
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
		console.log(tabla.length);
		i = 0;
		for (let tr of tabla) {
			let p = {
				hora: null,
				tiempo: null,
				eq1: null,
				eq2: null,
				eq1G: null,
				eq2G: null,
			};
			if (i % 2 == 0 && i != 0) {
				p.tiempo = $(tr).find('td.game-play').text();
				p.hora = $(tr).find('td.game-time').text();
				let eq = $(tr).find('td.game-t1').toArray();
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

		partidos.push(partido);
	}

	console.log(`hoy: ${fecha}`);
  console.log(partidos);
};

getData();
