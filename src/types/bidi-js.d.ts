declare module 'bidi-js' {
  interface BidiInstance {
    getEmbeddingLevels(text: string, direction?: 'ltr' | 'rtl'): any;
    getReorderedString(text: string, levels: any): string;
  }

  function bidiFactory(): BidiInstance;
  export default bidiFactory;
}