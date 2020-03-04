import fetch from 'node-fetch';
import * as XLSX from 'xlsx';

type OptArray<T> = T | T[];

const defaultPrefix = {
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  schema: 'http://schema.org/',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
};

export const fromGoogleSheets = (url: string) => {
  const sheetId = url.match(/^https?:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)[1];
  return fromUrl(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`);
};

export const fromUrl = async (url: string) => {
  const resp = await fetch(url);
  const xlsxBuffer = await resp.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(xlsxBuffer), { type: 'array' });
  return workbookToVocab(workbook);
};

export const fromFile = (filename: string) => {
  const wb = XLSX.readFile(filename);
  return workbookToVocab(wb);
};

export const fromArrayBuffer = (buffer: ArrayBuffer) => {
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  return workbookToVocab(wb);
};

export const fromUint8Array = (arr: Uint8Array) => {
  const wb = XLSX.read(arr, { type: 'array' });
  return workbookToVocab(wb);
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

const dataTypeWrap = (str: string, dt: string) => ({
  '@value': str,
  '@type': dt,
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

const map = <T, U>(val: OptArray<T>, f: (v:T)=>U): OptArray<U> => 
  Array.isArray(val) ? val.map(f) : f(val);

const uriRegex = new RegExp(
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
);
const isUri = (uri: string, prefixes: string[]) =>
  prefixes.some((prefix) => uri.startsWith(prefix + ':')) || uri.match(uriRegex);

const useDefPrefix = (prefixes: string[], defaultPrefix?: string) => (uri: string) =>
  defaultPrefix && !isUri(uri, prefixes) ? `${defaultPrefix}:${uri}` : uri;

const cellToEntryWithPref = (prefixes: string[], defaultPrefix?: string) => ([prop, val]: [
  string,
  string,
]) => {
  prop = prop.trim();
  val = val.trim();
  const usePrefix = useDefPrefix(prefixes, defaultPrefix)
  if (prop.toLowerCase() === 'uri') {
    return ['@id', usePrefix(val)];
  }
  if (prop === 'rdf:type' || prop === '@type') {
    return ['@type', map(splitCell(val), usePrefix)];
  }
  if (prop.includes('@')) {
    const [propName, lang] = prop.split('@').map((s) => s.trim());
    return [propName, langWrap(val, lang)];
  }
  if (prop.includes('^^')) {
    const [propName, dt] = prop.split('^^').map((s) => s.trim());
    return [propName, dataTypeWrap(val, dt)];
  }
  // base id array
  return [prop, idWraps(map(splitCell(val), usePrefix))];
};

const newOfType = (classSheet: unknown[], func: (e: [string, string]) => any) =>
  classSheet.map((row) =>
    fromEntries(
      Object.entries(row)
        .map(func)
        .filter((entry) => entry && entry[0]),
    ),
  );

const lCaseCompare = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

const getValueFrom = (obj, keys: string[]) =>
  Object.entries(obj).find(([k, v]) => keys.some((key) => lCaseCompare(k, key)))?.[1];

const getAllButValueFrom = (obj, keys: string[]) =>
  Object.entries(obj)
    .filter(([k, v]) => !keys.some((key) => lCaseCompare(k, key)))
    .map(([k, v]) => v);

const workbookToVocab = (wb: XLSX.WorkBook) => {
  if (Object.keys(wb.Sheets).length === 0) {
    throw new Error('No sheets found');
  }

  const prefixSheet = XLSX.utils.sheet_to_json(getValueFrom(wb.Sheets, ['prefix', 'prefixes']));

  const prefixRows = prefixSheet.filter(isPrefixRow);
  const setPrefix = fromEntries(prefixRows.map((row) => [row.prefix, row.url]));
  const prefix = { ...defaultPrefix, ...setPrefix };

  const prefixBase = prefixRows.find((row) => row['base'])?.prefix;

  const cellToEntry = cellToEntryWithPref(Object.keys(prefix), prefixBase);

  const classSheet = XLSX.utils.sheet_to_json(getValueFrom(wb.Sheets, ['classes', 'class']));
  const propertySheet = XLSX.utils.sheet_to_json(getValueFrom(wb.Sheets, ['properties', 'property']));

  const newClasses = newOfType(classSheet, cellToEntry).map((c) => ((c['@type'] = 'rdfs:Class'), c));
  const newProperties = newOfType(propertySheet, cellToEntry).map((p) => ((p['@type'] = 'rdf:Property'), p));

  const restSheets = getAllButValueFrom(wb.Sheets, ['prefixes', 'classes', 'properties', 'prefix', 'class', 'property']);

  const members = restSheets.flatMap((sheet) => {
    const jsonSheet = XLSX.utils.sheet_to_json(sheet);
    const newEnumerationMembers = newOfType(jsonSheet, cellToEntry);
    return newEnumerationMembers;
  });

  const vocab = {
    '@context': prefix,
    '@graph': [...newClasses, ...newProperties, ...members],
  };

  return vocab;
};
