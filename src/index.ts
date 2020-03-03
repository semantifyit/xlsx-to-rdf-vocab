import fetch from 'node-fetch';
import * as XLSX from 'xlsx';

interface Config {
  //exportType: 'ttl' | 'jsonld';
  sheets: {
    prefix: string;
    classes: string;
    properties: string;
    enumMembers: string;
  };
}
type OptConfig = Partial<Config>;

type OptArray<T> = T | T[];

const defaultPrefix = {
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  schema: 'http://schema.org/',
};

const defaultConfig = {
  exportType: 'jsonld',
  sheets: {
    prefix: 'Prefix',
    classes: 'Class',
    properties: 'Property',
    enumMembers: 'EnumMember',
  },
};

export const fromGoogleSheets = (url: string, config?: OptConfig) => {
  const sheetId = url.match(/^https?:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)[1];
  return fromUrl(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`, config);
};

export const fromUrl = async (url: string, config?: OptConfig) => {
  const resp = await fetch(url);
  const xlsxBuffer = await resp.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(xlsxBuffer), { type: 'array' });
  return workbookToVocab(workbook, config);
};

export const fromFile = (filename: string, config?: OptConfig) => {
  const wb = XLSX.readFile(filename);
  return workbookToVocab(wb, config);
};

export const fromArrayBuffer = (buffer: ArrayBuffer, config?: OptConfig) => {
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  return workbookToVocab(wb, config);
};

export const fromUint8Array = (arr: Uint8Array, config?: OptConfig) => {
  const wb = XLSX.read(arr, { type: 'array' });
  return workbookToVocab(wb, config);
};

interface PrefixRow {
  prefix: string;
  url: string;
}

const isPrefixRow = (row: unknown): row is PrefixRow => row['prefix'] && row['url'];

const idWrap = (str: string) => ({ '@id': str });

const idWraps = (str: OptArray<string>) => (Array.isArray(str) ? str.map(idWrap) : idWrap(str));

const langWrap = (str: string, lang: string) => ({
  '@value': str,
  '@language': lang,
});

const fromArray = <T>(arr: T[]): T | T[] => (arr.length > 1 ? arr : arr[0]);

const trim = (str: string) => str.trim();

const splitCell = (str: string) => fromArray(str.split(',').map(trim));

const fromEntries = (entries: any[][]) => {
  const obj = {};
  for (const [key, val] of entries) {
    if (!obj[key]) {
      obj[key] = val;
    } else if (obj[key] && !Array.isArray(obj[key])) {
      obj[key] = [obj[key], val];
    } else {
      obj[key].push(val);
    }
  }
  return obj;
};

const idRows = ['name', 'rdfs:Class', 'rdf:Property'];
const splitCellRows = ['rdf:type'];
const splitCellidWrapRows = [
  'rdfs:subClassOf',
  'schema:domainIncludes',
  'schema:rangeIncludes',
  'rdfs:subPropertyOf',
];
const strLangRows = ['rdfs:label', 'rdfs:comment'];

const cellToEntry = ([prop, val]: [string, string]) => {
  const cleanProp = prop.trim();
  if (idRows.includes(cleanProp)) {
    return ['@id', val];
  }
  if (splitCellRows.includes(cleanProp)) {
    return ['@type', splitCell(val)];
  }
  if (splitCellidWrapRows.includes(cleanProp)) {
    return [cleanProp, idWraps(splitCell(val))];
  }
  if (strLangRows.some((pRowName) => cleanProp.startsWith(pRowName))) {
    const propName = cleanProp.split('@')[0].trim();
    if (cleanProp.includes('@')) {
      const lang = cleanProp
        .split('@')
        .pop()
        .trim();
      return [propName, langWrap(val, lang)];
    }
    return [propName, val];
  }
};

const newOfType = (classSheet: unknown[], func: (e: [string, string]) => any) =>
  classSheet.map((row) =>
    fromEntries(
      Object.entries(row)
        .map(func)
        .filter((entry) => entry && entry[0]),
    ),
  );

const workbookToVocab = (wb: XLSX.WorkBook, userConfig: OptConfig = {}) => {
  const config = { ...defaultConfig, ...userConfig };
  config.sheets = { ...defaultConfig.sheets, ...userConfig.sheets };

  const prefixSheet = XLSX.utils.sheet_to_json(wb.Sheets[config.sheets.prefix]);
  const setPrefix = fromEntries(prefixSheet.filter(isPrefixRow).map((row) => [row.prefix, row.url]));
  const prefix = { ...defaultPrefix, ...setPrefix };

  const classSheet = XLSX.utils.sheet_to_json(wb.Sheets[config.sheets.classes]);
  const propertySheet = XLSX.utils.sheet_to_json(wb.Sheets[config.sheets.properties]);
  const enumerationMemberSheet = XLSX.utils.sheet_to_json(wb.Sheets[config.sheets.enumMembers]);

  const newClasses = newOfType(classSheet, cellToEntry).map((c) => ((c['@type'] = 'rdfs:Class'), c));
  const newProperties = newOfType(propertySheet, cellToEntry).map((p) => ((p['@type'] = 'rdf:Property'), p));
  const newEnumerationMembers = newOfType(enumerationMemberSheet, cellToEntry);

  const vocab = {
    '@context': prefix,
    '@graph': [...newClasses, ...newProperties, ...newEnumerationMembers],
  };

  return vocab;
};
