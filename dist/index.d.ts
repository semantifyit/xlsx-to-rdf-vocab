interface Config {
    sheets: {
        prefix: string;
        classes: string;
        properties: string;
        enumMembers: string;
    };
}
export declare const fromGoogleSheets: (url: string, config?: Partial<Config>) => Promise<{
    '@context': {
        rdfs: string;
        rdf: string;
        schema: string;
    };
    '@graph': {}[];
}>;
export declare const fromUrl: (url: string, config?: Partial<Config>) => Promise<{
    '@context': {
        rdfs: string;
        rdf: string;
        schema: string;
    };
    '@graph': {}[];
}>;
export declare const fromFile: (filename: string, config?: Partial<Config>) => {
    '@context': {
        rdfs: string;
        rdf: string;
        schema: string;
    };
    '@graph': {}[];
};
export declare const fromArrayBuffer: (buffer: ArrayBuffer, config?: Partial<Config>) => {
    '@context': {
        rdfs: string;
        rdf: string;
        schema: string;
    };
    '@graph': {}[];
};
export declare const fromUint8Array: (arr: Uint8Array, config?: Partial<Config>) => {
    '@context': {
        rdfs: string;
        rdf: string;
        schema: string;
    };
    '@graph': {}[];
};
export {};
