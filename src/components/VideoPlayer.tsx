import React, { useRef, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { toast } from "./ui/use-toast";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw,
  AlertCircle,
  Rewind,
  FastForward
} from "lucide-react";
import { extractSongInfo, searchLyrics, getLyrics } from "@/services/lyricsService";

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

    const metadata = await searchLyrics(songInfo.artist, songInfo.song);
    if (!metadata) {
      toast({
        title: "Lyrics not found",
        description: "Could not find lyrics for this song",
        variant: "destructive",
      });
      return;
    }

    const lyrics = await getLyrics(metadata.lyricId, metadata.lyricChecksum);
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
            const videoTitle = event.target.getVideoData().title;
            await fetchLyrics(videoTitle);
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
      <form onSubmit={handleUrlSubmit} className="mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="flex-1"
          />
          <Button type="submit">Load Video</Button>
        </div>
      </form>

      <div className="relative aspect-video bg-black/5 rounded-lg overflow-hidden mb-4">
        {!videoId && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <AlertCircle className="w-12 h-12" />
          </div>
        )}
        <div id="youtube-player" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSeek(-20)}
            className="hover-scale"
            title="Backward 20s"
          >
            <Rewind className="h-4 w-4" />
            <span className="absolute -bottom-5 text-xs">20s</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSeek(-10)}
            className="hover-scale"
            title="Backward 10s"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="absolute -bottom-5 text-xs">10s</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSeek(-5)}
            className="hover-scale"
            title="Backward 5s"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="absolute -bottom-5 text-xs">5s</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePlayPause}
            className="hover-scale"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSeek(5)}
            className="hover-scale"
            title="Forward 5s"
          >
            <RotateCw className="h-4 w-4" />
            <span className="absolute -bottom-5 text-xs">5s</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSeek(10)}
            className="hover-scale"
            title="Forward 10s"
          >
            <RotateCw className="h-4 w-4" />
            <span className="absolute -bottom-5 text-xs">10s</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleSeek(20)}
            className="hover-scale"
            title="Forward 20s"
          >
            <FastForward className="h-4 w-4" />
            <span className="absolute -bottom-5 text-xs">20s</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};