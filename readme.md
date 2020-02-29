# XLSX To RDF Vocabulary Converter

Convert Excel Sheets to Schema.org like JSON-LD RDF vocabularies. Given a correct excel sheet format, this package outputs vocabularies that conform to semantify.it's vocabularies (https://github.com/semantifyit/schema-org-adapter/blob/master/docu/vocabulary.md)

```javascript
const xlsxToRdfVocab = require('xlsxToRdfVocab');

const vocab = await xlsxToRdfVocab.fromGoogleSheets('<google-sheets-share-link>');
```

## Installation

#### NPM

Currently not on npm-repository, in future

`npm i xlsxToRdfVocab // !NOT YET`

With github: (needs `git` installed)

`npm i git+https://github.com/semantifyit/XlsxToRdfVocab`

Then simply require with

```javascript
const xlsxToRdfVocab = require('xlsxToRdfVocab');
```

### browser + CDN

```html
<script src="https://cdn.jsdelivr.net/gh/semantifyit/XlsxToRdfVocab/dist/bundle.js"></script>
```

## Examples / Sheet Template

Check out examples/\* for examples in different environments.

A sample template for a vocabulary is available via google sheets at: https://docs.google.com/spreadsheets/d/1-jWsfFAVzWLBcpY1CZKhwzdx9H34dxJB9OodiF-VatU/edit?usp=sharing

## API

#### .fromFile(filePath, options?)

#### .fromUrl(url, options?)

#### .fromGoogleSheets(url, options?)

#### .fromArrayBuffer(arrayBuffer, options?)

#### .fromUint8Array(uint8Array, options?)

Type: options:

Set sheets names for the different vocabulary term types:

```
{
 sheets: {
    prefix: 'Prefix',
    classes: 'Class',
    properties: 'Property',
    enumMembers: 'EnumMember',
  }
}
```
