#!/usr/bin/node
var fromGoogleSheets = require('../').fromGoogleSheets;
if (process.argv.length !== 4) {
    console.error('Wrong call, call with: xlsx-to-rdf-vocab -gs "<google_sheet_link>"');
    process.exit(1);
}
var config = process.argv[2];
if (config === '-h' || config === '--help') {
    console.log('Call with: xlsx-to-rdf-vocab -gs "<google_sheet_link>"');
    process.exit(0);
}
if (config === '-gs') {
    fromGoogleSheets(process.argv[3]).then(function (vocab) { return console.log(JSON.stringify(vocab, null, 2)); });
}
else {
    console.error('Unknown option: ' + config);
    process.exit(1);
}
//console.log(fromGoogleSheets(process.argv[2]))
//# sourceMappingURL=cli.js.map