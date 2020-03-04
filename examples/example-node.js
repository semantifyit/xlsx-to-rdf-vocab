const xlsxToRdfVocab = require('../');

(async () => {
  const vocab = await xlsxToRdfVocab.fromGoogleSheets(
    'https://docs.google.com/spreadsheets/d/1QZFtl1hIeZ6bOkaPY7csFHKZSxdJicBCf69WNHPrGc8/edit#gid=704735681',
  );

  console.log(JSON.stringify(vocab, null, 2));
})();
