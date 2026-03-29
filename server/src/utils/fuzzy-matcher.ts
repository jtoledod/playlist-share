export class FuzzyMatcher {
  private static readonly TITLE_THRESHOLD = 0.65;
  private static readonly ARTIST_THRESHOLD = 0.6;

  static tokenize(str: string): Set<string> {
    return new Set(
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean)
    );
  }

  static jaccardSimilarity(str1: string, str2: string): number {
    const tokens1 = this.tokenize(str1);
    const tokens2 = this.tokenize(str2);

    if (tokens1.size === 0 || tokens2.size === 0) {
      return 0;
    }

    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    return intersection.size / union.size;
  }

  static levenshteinSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0 || len2 === 0) {
      return len1 === len2 ? 1 : 0;
    }

    const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return 1 - matrix[len1][len2] / maxLen;
  }

  static fuzzyMatch(str1: string, str2: string): number {
    const jaccard = this.jaccardSimilarity(str1, str2);
    const levenshtein = this.levenshteinSimilarity(str1, str2);

    const exactMatch = str1.includes(str2) || str2.includes(str1) ? 0.1 : 0;

    return Math.max(jaccard * 0.6 + levenshtein * 0.4 + exactMatch, jaccard, levenshtein);
  }

  static matchSong(
    originalTitle: string,
    originalArtist: string,
    resultTitle: string,
    resultArtist: string
  ): { matches: boolean; titleScore: number; artistScore: number } {
    const normalizedOriginalTitle = originalTitle.toLowerCase().trim();
    const normalizedOriginalArtist = originalArtist.toLowerCase().trim();
    const normalizedResultTitle = resultTitle.toLowerCase().trim();
    const normalizedResultArtist = resultArtist.toLowerCase().trim();

    const titleScore = this.fuzzyMatch(normalizedOriginalTitle, normalizedResultTitle);
    const artistScore = this.fuzzyMatch(normalizedOriginalArtist, normalizedResultArtist);

    return {
      matches: titleScore >= this.TITLE_THRESHOLD && artistScore >= this.ARTIST_THRESHOLD,
      titleScore,
      artistScore,
    };
  }
}
