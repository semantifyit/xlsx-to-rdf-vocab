#!/usr/bin/node

const {fromGoogleSheets} = require('../');

if (process.argv.length !== 4) {
  console.error('Wrong call, call with: xlsx-to-rdf-vocab -gs "<google_sheet_link>"')
  process.exit(1);
}

const config = process.argv[2];

if(config === '-h' || config === '--help') {
  console.log('Call with: xlsx-to-rdf-vocab -gs "<google_sheet_link>"')
  process.exit(0);
}

if(config === '-gs') {
  fromGoogleSheets(process.argv[3]).then(vocab => console.log(JSON.stringify(vocab, null, 2)))
} else {
  console.error('Unknown option: ' + config);
  process.exit(1);
}


//console.log(fromGoogleSheets(process.argv[2]))