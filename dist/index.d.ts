export declare const fromGoogleSheets: (url: string) => Promise<{
    '@context': {
        rdfs: string;
        rdf: string;
        schema: string;
        xsd: string;
    };
    '@graph': {}[];
}>;
export declare const fromUrl: (url: string) => Promise<{
    '@context': {
        rdfs: string;
        rdf: string;
        schema: string;
        xsd: string;
    };
    '@graph': {}[];
}>;
export declare const fromFile: (filename: string) => {
    '@context': {
        rdfs: string;
        rdf: string;
        schema: string;
        xsd: string;
    };
    '@graph': {}[];
};
export declare const fromArrayBuffer: (buffer: ArrayBuffer) => {
    '@context': {
        rdfs: string;
        rdf: string;
        schema: string;
        xsd: string;
    };
    '@graph': {}[];
};
export declare const fromUint8Array: (arr: Uint8Array) => {
    '@context': {
        rdfs: string;
        rdf: string;
        schema: string;
        xsd: string;
    };
    '@graph': {}[];
};
