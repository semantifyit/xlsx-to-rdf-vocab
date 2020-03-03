const xlsxToRdfVocab = require('../');

(async () => {
  const vocab = await xlsxToRdfVocab.fromGoogleSheets(
    'https://docs.google.com/spreadsheets/d/1anSwqUony4cnsDFT0BUNUkZnTiDtDOO3I7XmmF4vXyo',
  );

  console.log(JSON.stringify(vocab, null, 2));
})();
