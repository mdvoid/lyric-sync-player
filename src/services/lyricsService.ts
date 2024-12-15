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
    const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch lyrics');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching lyrics:', error);
    return null;
  }
};

export const getLyrics = async (artist: string, song: string): Promise<string | null> => {
  try {
    const data = await searchLyrics(artist, song);
    return data?.lyrics || null;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
};