import React, { useState } from "react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LyricsDisplay } from "@/components/LyricsDisplay";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lyrics, setLyrics] = useState<string | undefined>();

  const handleVideoLoad = async () => {
    setIsLoading(true);
    // TODO: Implement lyrics fetching
    // For now, we'll use placeholder lyrics
    setTimeout(() => {
      setLyrics(
        "This is a placeholder for lyrics.\n\nWhen connected to the lyrics API,\nreal lyrics will appear here.\n\nThe lyrics will be properly formatted\nand synchronized with the video playback."
      );
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Music Video Lyrics
        </h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <VideoPlayer onVideoLoad={handleVideoLoad} />
          </div>
          <div>
            <LyricsDisplay lyrics={lyrics} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;