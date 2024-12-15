import React, { useRef, useEffect, useState } from "react";
import { Card } from "../ui/card";
import { toast } from "../ui/use-toast";
import { AlertCircle } from "lucide-react";
import { extractSongInfo, getLyrics } from "@/services/lyricsService";
import { Controls } from "./Controls";
import { URLInput } from "./URLInput";

interface VideoPlayerProps {
  onVideoLoad?: (lyrics?: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ onVideoLoad }) => {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      if (videoId) {
        initializePlayer(videoId);
      }
    };
  }, []);

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const fetchLyrics = async (title: string) => {
    const songInfo = extractSongInfo(title);
    if (!songInfo) {
      toast({
        title: "Could not extract song information",
        description: "Please check if the video title follows the format 'Artist - Song'",
        variant: "destructive",
      });
      return;
    }

    const lyrics = await getLyrics(songInfo.artist, songInfo.song);
    if (lyrics) {
      onVideoLoad?.(lyrics);
    } else {
      toast({
        title: "Error fetching lyrics",
        description: "Could not fetch the lyrics for this song",
        variant: "destructive",
      });
    }
  };

  const initializePlayer = (videoId: string) => {
    if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "360",
        width: "640",
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: async (event) => {
            const player = event.target;
            const videoData = player.getVideoData?.();
            if (videoData?.title) {
              await fetchLyrics(videoData.title);
            }
          },
          onStateChange: (event) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      initializePlayer(id);
    } else {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube video URL",
        variant: "destructive",
      });
    }
  };

  const handleSeek = (seconds: number) => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime + seconds, true);
    }
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  };

  return (
    <Card className="p-6 glass-panel">
      <URLInput 
        url={url} 
        onUrlChange={setUrl} 
        onSubmit={handleUrlSubmit} 
      />

      <div className="relative aspect-video bg-black/5 rounded-lg overflow-hidden mb-4">
        {!videoId && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <AlertCircle className="w-12 h-12" />
          </div>
        )}
        <div id="youtube-player" />
      </div>

      <div className="flex flex-col gap-3">
        <Controls 
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
        />
      </div>
    </Card>
  );
};