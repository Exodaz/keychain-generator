// Curated list of popular Google Fonts (with Thai support where available)
export const FONT_LIST = [
  { name: 'Roboto', family: 'Roboto', weight: 700 },
  { name: 'Inter', family: 'Inter', weight: 700 },
  { name: 'Outfit', family: 'Outfit', weight: 700 },
  { name: 'Poppins', family: 'Poppins', weight: 700 },
  { name: 'Montserrat', family: 'Montserrat', weight: 700 },
  { name: 'Oswald', family: 'Oswald', weight: 700 },
  { name: 'Playfair Display', family: 'Playfair+Display', weight: 700 },
  { name: 'Bebas Neue', family: 'Bebas+Neue', weight: 400 },
  { name: 'Pacifico', family: 'Pacifico', weight: 400 },
  { name: 'Lobster', family: 'Lobster', weight: 400 },
  { name: 'Righteous', family: 'Righteous', weight: 400 },
  { name: 'Permanent Marker', family: 'Permanent+Marker', weight: 400 },
  { name: 'Orbitron', family: 'Orbitron', weight: 700 },
  { name: 'Press Start 2P', family: 'Press+Start+2P', weight: 400 },
  { name: 'Kanit', family: 'Kanit', weight: 700 },
  { name: 'Prompt', family: 'Prompt', weight: 700 },
  { name: 'Sarabun', family: 'Sarabun', weight: 700 },
  { name: 'Noto Sans Thai', family: 'Noto+Sans+Thai', weight: 700 },
  { name: 'IBM Plex Sans Thai', family: 'IBM+Plex+Sans+Thai', weight: 700 },
  { name: 'Chakra Petch', family: 'Chakra+Petch', weight: 700 },
  { name: 'Bungee', family: 'Bungee', weight: 400 },
  { name: 'Fredoka', family: 'Fredoka', weight: 700 },
];

export class FontManager {
  constructor() {
    this.cache = new Map();
    this.TTFLoader = null;
    this.Font = null;
    this._loadersReady = this._initLoaders();
  }

  async _initLoaders() {
    const [{ TTFLoader }, { Font }] = await Promise.all([
      import('three/addons/loaders/TTFLoader.js'),
      import('three/addons/loaders/FontLoader.js'),
    ]);
    this.TTFLoader = TTFLoader;
    this.Font = Font;
  }

  async _getTTFUrl(fontFamily, weight) {
    // Use Vite proxy with old User-Agent to get TTF URLs from Google Fonts
    const cssUrl = `/gfonts-css/css2?family=${fontFamily}:wght@${weight}&display=swap`;
    try {
      const response = await fetch(cssUrl);
      const cssText = await response.text();
      // Extract the font file URL from CSS
      const urlMatch = cssText.match(/url\(([^)]+)\)/i);
      if (urlMatch) {
        let url = urlMatch[1];
        // Rewrite fonts.gstatic.com to use our proxy
        url = url.replace('https://fonts.gstatic.com', '/gfonts-file');
        return url;
      }
    } catch (e) {
      console.error('Failed to fetch font CSS:', e);
    }
    return null;
  }

  async loadFont(fontName) {
    if (this.cache.has(fontName)) {
      return this.cache.get(fontName);
    }

    await this._loadersReady;

    const fontEntry = FONT_LIST.find(f => f.name === fontName);
    if (!fontEntry) {
      throw new Error(`Font "${fontName}" not found in font list`);
    }

    const ttfUrl = await this._getTTFUrl(fontEntry.family, fontEntry.weight);
    if (!ttfUrl) {
      throw new Error(`Could not find TTF URL for "${fontName}"`);
    }

    // Fetch the font as ArrayBuffer and parse directly
    const response = await fetch(ttfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download font file: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    const loader = new this.TTFLoader();
    const json = loader.parse(arrayBuffer);
    const font = new this.Font(json);
    this.cache.set(fontName, font);
    return font;
  }

  getCachedFont(fontName) {
    return this.cache.get(fontName) || null;
  }
}
