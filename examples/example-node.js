const xlsxToRdfVocab = require('../');

(async () => {
  const vocab = await xlsxToRdfVocab.fromGoogleSheets(
    'https://docs.google.com/spreadsheets/d/1WNiA4NqCsanY3G_nZ2Ha3SVBi50uo6mphgDB-O_ytzc',
  );

  console.log(JSON.stringify(vocab, null, 2));
})();
