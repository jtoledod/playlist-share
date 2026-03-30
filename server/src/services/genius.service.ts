import axios from 'axios';
import { createLogger } from '../logger.js';
import { FuzzyMatcher } from '../utils/fuzzy-matcher.js';

const logger = createLogger('genius');
const GENIUS_API_BASE = 'https://api.genius.com';

export interface GeniusSongResult {
  id: number;
  title: string;
  artist: string;
  artistId?: number;
  artistThumbnail?: string;
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

  async searchSong(query: string, originalTitle: string, originalArtist: string): Promise<GeniusSongResult | null> {
    if (!this.accessToken || this.accessToken === 'your_genius_access_token') {
      logger.warn('No valid access token configured');
      return null;
    }

    const cacheKey = query.toLowerCase().trim();
    if (this.cache.has(cacheKey)) {
      logger.debug({ query }, 'Cache hit');
      return this.cache.get(cacheKey) || null;
    }

    try {
      logger.debug({ url: `${GENIUS_API_BASE}/search`, query }, 'Searching song');
      const response = await axios.get(`${GENIUS_API_BASE}/search`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${this.accessToken}` },
        timeout: 10000
      });

      const hits = response.data.response?.hits;
      if (!hits || hits.length === 0) {
        logger.debug({ query }, 'No results found');
        this.cache.set(cacheKey, null);
        return null;
      }

      for (const hit of hits) {
        if (hit.type !== 'song') {
          continue
        }

        const result = this.mapSongResult(hit.result)

        const { matches, titleScore, artistScore } = FuzzyMatcher.matchSong(
          originalTitle,
          originalArtist,
          result.title,
          result.artist
        )

        if (matches) {
          logger.info({ title: result.title, artist: result.artist, titleScore, artistScore }, 'Match found');
          this.cache.set(cacheKey, result)
          return result
        }
      }

      logger.debug({ originalTitle, originalArtist }, 'No matching song found');
      this.cache.set(cacheKey, null)
      return null
    } catch (error: any) {
      logger.error({ error: error.message }, 'Search error');
      return null;
    }
  }

  async getSongDetails(geniusId: number): Promise<GeniusSongResult | null> {
    if (!this.accessToken || this.accessToken === 'your_genius_access_token') {
      return null;
    }

    try {
      logger.debug({ url: `${GENIUS_API_BASE}/songs/${geniusId}` }, 'Fetching song details');
      const response = await axios.get(`${GENIUS_API_BASE}/songs/${geniusId}`, {
        params: { text_format: 'plain' },
        headers: { Authorization: `Bearer ${this.accessToken}` },
        timeout: 10000
      });

      return this.mapSongDetails(response.data.response.song);
    } catch (error: any) {
      logger.error({ error: error.message }, 'Song details error');
      return null;
    }
  }

  private mapSongResult(result: any): GeniusSongResult {
    return {
      id: result.id,
      title: result.title,
      artist: result.primary_artist?.name || 'Unknown',
      artistId: result.primary_artist?.id,
      artistThumbnail: result.primary_artist?.image_url,
      album: result.album?.name,
      albumArt: result.album?.cover_art_url || result.header_image_url,
      releaseDate: result.release_date,
      lyricsUrl: result.url
    };
  }

  private mapSongDetails(song: any): GeniusSongResult {
    return {
      id: song.id,
      title: song.title,
      artist: song.primary_artist?.name || 'Unknown',
      artistId: song.primary_artist?.id,
      artistThumbnail: song.primary_artist?.image_url,
      album: song.album?.name,
      albumArt: song.album?.cover_art_url || song.header_image_url,
      releaseDate: song.release_date,
      lyricsUrl: song.url
    };
  }
}

let geniusService: GeniusService | null = null;

export function getGeniusService(): GeniusService {
  if (!geniusService) {
    const token = process.env.GENIUS_ACCESS_TOKEN;
    if (!token) {
      logger.warn('No GENIUS_ACCESS_TOKEN configured');
    }
    geniusService = new GeniusService(token || '');
  }
  return geniusService;
}
