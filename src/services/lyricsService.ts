interface SongInfo {
  artist: string;
  song: string;
}

const sanitizeForUrl = (text: string): string => {
  // Remove special characters and extra spaces
  return text
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};

const parseVideoTitleWithAI = async (videoTitle: string, apiKey: string): Promise<SongInfo | null> => {
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a music metadata parser. Extract the artist name and song title from YouTube video titles. Return only JSON in format {\"artist\": \"name\", \"song\": \"title\"}. Clean the names by removing featuring artists, remix info, or video type indicators."
          },
          {
            role: "user",
            content: `Parse this YouTube music video title: "${videoTitle}"`
          }
        ],
        model: "grok-beta",
        stream: false,
        temperature: 0
      })
    });

    if (!response.ok) {
      throw new Error('Failed to parse video title');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      artist: sanitizeForUrl(result.artist),
      song: sanitizeForUrl(result.song)
    };
  } catch (error) {
    console.error('Error parsing video title:', error);
    return null;
  }
};

export const extractSongInfo = async (videoTitle: string, apiKey: string): Promise<SongInfo | null> => {
  // First try AI parsing
  const aiResult = await parseVideoTitleWithAI(videoTitle, apiKey);
  if (aiResult) {
    return aiResult;
  }

  // Fallback to regex parsing if AI fails
  const patterns = [
    /^(.+?)\s*-\s*(.+?)(?:\s*\(.*?\))*(?:\s*\[.*?\])*\s*$/,
    /^(.+?)\s*"\s*(.+?)\s*"(?:\s*\(.*?\))*(?:\s*\[.*?\])*\s*$/,
    /^(.+?)\s*:\s*(.+?)(?:\s*\(.*?\))*(?:\s*\[.*?\])*\s*$/,
  ];

  for (const pattern of patterns) {
    const match = videoTitle.match(pattern);
    if (match) {
      return {
        artist: sanitizeForUrl(match[1]),
        song: sanitizeForUrl(match[2])
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