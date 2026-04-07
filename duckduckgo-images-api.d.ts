declare module 'duckduckgo-images-api' {
    export function queryImages(query: string): Promise<Array<{
        width: number;
        height: number;
        image: string;
        thumbnail: string;
        title: string;
        source: string;
        url: string;
    }>>;
}