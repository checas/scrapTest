const fetch = require('node-fetch');
const cheerio = require('cheerio');

// function to get the raw data
const getRawData = (URL) => {
	return fetch(URL)
		.then((response) => response.text())
		.then((data) => {
			return data;
		});
};

const url = 'https://www.resultados-futbol.com/copa_liga_profesional_argentina'

const getFechaNacional = async () => {
	const data = await getRawData(url);
	const parsedData = cheerio.load(data);
	const jornada = parsedData('#desplegar').text();
	console.log(jornada);
	const parseDataTable = parsedData('#tabla1')[0].children[1].children
	//console.log(parseDataTable)
	console.log('Fecha --- equipo1 --- resultado --- equipo2');

	parseDataTable.forEach((row) => {
		if(row.name === 'tr') {
			let fecha = null
			let eq1 = null
			let eq2 = null
			let resultado = null
			const columns = row.children.filter((column) => column.name === 'td');

			const columnaFecha = columns[1];
			if(columnaFecha){
				fecha = columnaFecha.data
			}

			const columnaEq1 = columns[2];
			console.log(columnaEq1);
			/*
			if(columnaEq1){
				eq1 = columnaEq1.children[1]
				if(eq1){
					eq1 = eq1.data
				}
			}
			if(eq1){
				console.log(eq1)
			}
			*/
		}
	})
}

getFechaNacional();
/*
// URL for data
const URL = 'https://en.wikipedia.org/wiki/Cricket_World_Cup';

// start of the program
const getCricketWorldCupsList = async () => {
	const cricketWorldCupRawData = await getRawData(URL);

	// parsing the data
	const parsedCricketWorldCupData = cheerio.load(cricketWorldCupRawData);

	// extracting the table data
	const worldCupsDataTable = parsedCricketWorldCupData('table.wikitable')[0].children[1].children;

	console.log('Year --- Winner --- Runner');
	worldCupsDataTable.forEach((row) => {
		// extracting `td` tags
		if (row.name === 'tr') {
			let year = null,
				winner = null,
				runner = null;

			const columns = row.children.filter((column) => column.name === 'td');

			// extracting year
			const yearColumn = columns[0];
			if (yearColumn) {
				year = yearColumn.children[0];
				if (year) {
					year = year.children[0].data;
				}
			}

			// extracting winner
			const winnerColumn = columns[3];
			if (winnerColumn) {
				winner = winnerColumn.children[1];
				if (winner) {
					winner = winner.children[0].data;
				}
			}

			// extracting runner
			const runnerColumn = columns[5];
			if (runnerColumn) {
				runner = runnerColumn.children[1];
				if (runner) {
					runner = runner.children[0].data;
				}
			}

			if (year && winner && runner) {
				console.log(`${year} --- ${winner} --- ${runner}`);
			}
		}
	});
};

// invoking the main function
getCricketWorldCupsList();
*/