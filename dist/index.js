"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = require("node-fetch");
var XLSX = require("xlsx");
var defaultPrefix = {
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    schema: 'http://schema.org/',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
};
exports.fromGoogleSheets = function (url) {
    var sheetId = url.match(/^https?:\/\/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)[1];
    return exports.fromUrl("https://docs.google.com/spreadsheets/d/" + sheetId + "/export?format=xlsx");
};
exports.fromUrl = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var resp, xlsxBuffer, workbook;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, node_fetch_1.default(url)];
            case 1:
                resp = _a.sent();
                return [4 /*yield*/, resp.arrayBuffer()];
            case 2:
                xlsxBuffer = _a.sent();
                workbook = XLSX.read(new Uint8Array(xlsxBuffer), { type: 'array' });
                return [2 /*return*/, workbookToVocab(workbook)];
        }
    });
}); };
exports.fromFile = function (filename) {
    var wb = XLSX.readFile(filename);
    return workbookToVocab(wb);
};
exports.fromArrayBuffer = function (buffer) {
    var wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    return workbookToVocab(wb);
};
exports.fromUint8Array = function (arr) {
    var wb = XLSX.read(arr, { type: 'array' });
    return workbookToVocab(wb);
};
var isPrefixRow = function (row) { return row['prefix'] && row['url']; };
var idWrap = function (str) { return ({ '@id': str }); };
var idWraps = function (str) { return (Array.isArray(str) ? str.map(idWrap) : idWrap(str)); };
var langWrap = function (str, lang) { return ({
    '@value': str,
    '@language': lang,
}); };
var dataTypeWrap = function (str, dt) { return ({
    '@value': str,
    '@type': dt,
}); };
var fromArray = function (arr) { return (arr.length > 1 ? arr : arr[0]); };
var trim = function (str) { return str.trim(); };
var splitCell = function (str) { return fromArray(str.split(',').map(trim)); };
var fromEntries = function (entries) {
    var obj = {};
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var _a = entries_1[_i], key = _a[0], val = _a[1];
        if (!obj[key]) {
            obj[key] = val;
        }
        else if (obj[key] && !Array.isArray(obj[key])) {
            obj[key] = [obj[key], val];
        }
        else {
            obj[key].push(val);
        }
    }
    return obj;
};
var map = function (val, f) {
    return Array.isArray(val) ? val.map(f) : f(val);
};
var uriRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);
var isUri = function (uri, prefixes) {
    return prefixes.some(function (prefix) { return uri.startsWith(prefix + ':'); }) || uri.match(uriRegex);
};
var useDefPrefix = function (prefixes, defaultPrefix) { return function (uri) {
    return defaultPrefix && !isUri(uri, prefixes) ? defaultPrefix + ":" + uri : uri;
}; };
var cellToEntryWithPref = function (prefixes, defaultPrefix) { return function (_a) {
    var prop = _a[0], val = _a[1];
    prop = prop.trim();
    val = val.trim();
    var usePrefix = useDefPrefix(prefixes, defaultPrefix);
    if (prop.toLowerCase() === 'uri') {
        return ['@id', usePrefix(val)];
    }
    if (prop === 'rdf:type' || prop === '@type') {
        return ['@type', map(splitCell(val), usePrefix)];
    }
    if (prop.includes('@')) {
        var _b = prop.split('@').map(function (s) { return s.trim(); }), propName = _b[0], lang = _b[1];
        return [propName, langWrap(val, lang)];
    }
    if (prop.includes('^^')) {
        var _c = prop.split('^^').map(function (s) { return s.trim(); }), propName = _c[0], dt = _c[1];
        return [propName, dataTypeWrap(val, dt)];
    }
    // base id array
    return [prop, idWraps(map(splitCell(val), usePrefix))];
}; };
var newOfType = function (classSheet, func) {
    return classSheet.map(function (row) {
        return fromEntries(Object.entries(row)
            .map(func)
            .filter(function (entry) { return entry && entry[0]; }));
    });
};
var lCaseCompare = function (a, b) { return a.toLowerCase() === b.toLowerCase(); };
var getValueFrom = function (obj, keys) { var _a; return (_a = Object.entries(obj).find(function (_a) {
    var k = _a[0], v = _a[1];
    return keys.some(function (key) { return lCaseCompare(k, key); });
})) === null || _a === void 0 ? void 0 : _a[1]; };
var getAllButValueFrom = function (obj, keys) {
    return Object.entries(obj)
        .filter(function (_a) {
        var k = _a[0], v = _a[1];
        return !keys.some(function (key) { return lCaseCompare(k, key); });
    })
        .map(function (_a) {
        var k = _a[0], v = _a[1];
        return v;
    });
};
var workbookToVocab = function (wb) {
    var _a;
    if (Object.keys(wb.Sheets).length === 0) {
        throw new Error('No sheets found');
    }
    var prefixSheet = XLSX.utils.sheet_to_json(getValueFrom(wb.Sheets, ['prefix', 'prefixes']));
    var prefixRows = prefixSheet.filter(isPrefixRow);
    var setPrefix = fromEntries(prefixRows.map(function (row) { return [row.prefix, row.url]; }));
    var prefix = __assign(__assign({}, defaultPrefix), setPrefix);
    var prefixBase = (_a = prefixRows.find(function (row) { return row['base']; })) === null || _a === void 0 ? void 0 : _a.prefix;
    var cellToEntry = cellToEntryWithPref(Object.keys(prefix), prefixBase);
    var classSheet = XLSX.utils.sheet_to_json(getValueFrom(wb.Sheets, ['classes', 'class']));
    var propertySheet = XLSX.utils.sheet_to_json(getValueFrom(wb.Sheets, ['properties', 'property']));
    var newClasses = newOfType(classSheet, cellToEntry).map(function (c) { return ((c['@type'] = 'rdfs:Class'), c); });
    var newProperties = newOfType(propertySheet, cellToEntry).map(function (p) { return ((p['@type'] = 'rdf:Property'), p); });
    var restSheets = getAllButValueFrom(wb.Sheets, ['prefixes', 'classes', 'properties', 'prefix', 'class', 'property']);
    var members = restSheets.flatMap(function (sheet) {
        var jsonSheet = XLSX.utils.sheet_to_json(sheet);
        var newEnumerationMembers = newOfType(jsonSheet, cellToEntry);
        return newEnumerationMembers;
    });
    var vocab = {
        '@context': prefix,
        '@graph': __spreadArrays(newClasses, newProperties, members),
    };
    return vocab;
};
//# sourceMappingURL=index.js.map