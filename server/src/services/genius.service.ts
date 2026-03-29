import axios from 'axios';

const GENIUS_API_BASE = 'https://api.genius.com';

export interface GeniusSongResult {
  id: number;
  title: string;
  artist: string;
  album?: string;
  albumArt?: string;
  releaseDate?: string;
  lyricsUrl?: string;
}

export class GeniusService {
  private accessToken: string;
  private cache: Map<string, GeniusSongResult | null> = new Map();

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async searchSong(query: string): Promise<GeniusSongResult | null> {
    if (!this.accessToken || this.accessToken === 'your_genius_access_token') {
      console.log('[Genius] No valid access token configured');
      return null;
    }

    const cacheKey = query.toLowerCase().trim();
    if (this.cache.has(cacheKey)) {
      console.log(`[Genius] Cache hit for: ${query}`);
      return this.cache.get(cacheKey) || null;
    }

    try {
      const response = await axios.get(`${GENIUS_API_BASE}/search`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${this.accessToken}` },
        timeout: 10000
      });

      const hits = response.data.response?.hits;
      if (!hits || hits.length === 0) {
        console.log(`[Genius] No results for: ${query}`);
        this.cache.set(cacheKey, null);
        return null;
      }

      const result = this.mapSongResult(hits[0].result);
      console.log(`[Genius] Found: ${result.title} by ${result.artist}`);
      this.cache.set(cacheKey, result);
      return result;
    } catch (error: any) {
      console.error('[Genius] Search error:', error.message);
      return null;
    }
  }

  async getSongDetails(geniusId: number): Promise<GeniusSongResult | null> {
    if (!this.accessToken || this.accessToken === 'your_genius_access_token') {
      return null;
    }

    try {
      const response = await axios.get(`${GENIUS_API_BASE}/songs/${geniusId}`, {
        params: { text_format: 'plain' },
        headers: { Authorization: `Bearer ${this.accessToken}` },
        timeout: 10000
      });

      return this.mapSongDetails(response.data.response.song);
    } catch (error: any) {
      console.error('[Genius] Song details error:', error.message);
      return null;
    }
  }

  private mapSongResult(result: any): GeniusSongResult {
    return {
      id: result.id,
      title: result.title,
      artist: result.primary_artist?.name || 'Unknown',
      album: result.album?.name,
      albumArt: result.album?.cover_art_url || result.header_image_url,
      releaseDate: result.release_date_for_display,
      lyricsUrl: result.url
    };
  }

  private mapSongDetails(song: any): GeniusSongResult {
    return {
      id: song.id,
      title: song.title,
      artist: song.primary_artist?.name || 'Unknown',
      album: song.album?.name,
      albumArt: song.album?.cover_art_url || song.header_image_url,
      releaseDate: song.release_date_for_display,
      lyricsUrl: song.url
    };
  }
}

let geniusService: GeniusService | null = null;

export function getGeniusService(): GeniusService {
  if (!geniusService) {
    const token = process.env.GENIUS_ACCESS_TOKEN;
    if (!token) {
      console.warn('[Genius] No GENIUS_ACCESS_TOKEN configured');
    }
    geniusService = new GeniusService(token || '');
  }
  return geniusService;
}
