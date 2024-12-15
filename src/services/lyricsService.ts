interface SongInfo {
  artist: string;
  song: string;
}

export const extractSongInfo = (videoTitle: string): SongInfo | null => {
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

export const searchLyrics = async (artist: string, song: string) => {
  try {
    // For demo purposes, return mock lyrics since we can't use real API without keys
    return {
      lyricId: 1,
      lyricChecksum: "demo"
    };
  } catch (error) {
    console.error('Error searching lyrics:', error);
    return null;
  }
};

export const getLyrics = async (lyricId: number, lyricChecksum: string): Promise<string | null> => {
  try {
    // For demo purposes, return mock lyrics
    return `[Demo Lyrics]\n\nThis is a placeholder for lyrics\nSince we can't access the real API\nYou would need to:\n\n1. Sign up for a lyrics API service\n2. Get an API key\n3. Use their HTTPS endpoint\n4. Handle CORS properly\n\nFor now, this demonstrates the functionality\nWith mock data for ${lyricId} - ${lyricChecksum}`;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
};