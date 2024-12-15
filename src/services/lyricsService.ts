import { XMLParser } from 'fast-xml-parser';

interface LyricMetadata {
  lyricId: number;
  lyricChecksum: string;
}

interface SearchResult {
  TrackChecksum: string;
  TrackId: number;
  LyricChecksum: string;
  LyricId: number;
  SongUrl: string;
  ArtistUrl: string;
  Artist: string;
  Song: string;
  SongRank: number;
}

export const searchLyrics = async (artist: string, song: string): Promise<LyricMetadata | null> => {
  try {
    const response = await fetch(
      `https://api.chartlyrics.com/apiv1.asmx/SearchLyric?artist=${encodeURIComponent(
        artist
      )}&song=${encodeURIComponent(song)}`
    );
    
    const xmlData = await response.text();
    const parser = new XMLParser();
    const result = parser.parse(xmlData);
    
    const searchResults = result.ArrayOfSearchLyricResult?.SearchLyricResult;
    
    if (!searchResults) {
      console.log('No lyrics found');
      return null;
    }
    
    // Get the first result if there are multiple
    const firstResult = Array.isArray(searchResults) ? searchResults[0] : searchResults;
    
    return {
      lyricId: firstResult.LyricId,
      lyricChecksum: firstResult.LyricChecksum,
    };
  } catch (error) {
    console.error('Error searching lyrics:', error);
    return null;
  }
};

export const getLyrics = async (lyricId: number, lyricChecksum: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://api.chartlyrics.com/apiv1.asmx/GetLyric?lyricId=${lyricId}&lyricChecksum=${lyricChecksum}`
    );
    
    const xmlData = await response.text();
    const parser = new XMLParser();
    const result = parser.parse(xmlData);
    
    return result.GetLyricResult?.Lyric || null;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
};

export const extractSongInfo = (videoTitle: string): { artist: string; song: string } | null => {
  // Common patterns in music video titles
  const patterns = [
    /^(.+?)\s*-\s*(.+?)(?:\s*\(.*?\))*(?:\s*\[.*?\])*\s*$/,  // Artist - Song (Official Video)
    /^(.+?)\s*"\s*(.+?)\s*"(?:\s*\(.*?\))*(?:\s*\[.*?\])*\s*$/,  // Artist "Song" (Official Video)
    /^(.+?)\s*:\s*(.+?)(?:\s*\(.*?\))*(?:\s*\[.*?\])*\s*$/,  // Artist: Song (Official Video)
  ];

  for (const pattern of patterns) {
    const match = videoTitle.match(pattern);
    if (match) {
      return {
        artist: match[1].trim(),
        song: match[2].trim()
      };
    }
  }

  return null;
};