import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize,
  Volume2,
  VolumeX
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  duration: number; // in seconds
  lastPosition?: number; // in seconds
  onProgress?: (currentTime: number, totalTime: number) => void;
  onEnded?: () => void;
}

export default function VideoPlayer({
  videoUrl,
  title,
  duration,
  lastPosition = 0,
  onProgress,
  onEnded
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(lastPosition);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      // Resume from last position
      if (lastPosition > 0) {
        video.currentTime = lastPosition;
      }
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration || duration;
      setCurrentTime(current);
      
      // Report progress every few seconds
      if (onProgress && current % 5 < 0.5) {
        onProgress(current, total);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) {
        onEnded();
      }
      if (onProgress) {
        onProgress(video.duration || duration, video.duration || duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoUrl, duration, lastPosition, onProgress, onEnded]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration || duration, video.currentTime + 10);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="bg-gray-900 dark:bg-gray-950 border-gray-700 dark:border-gray-800">
      <CardContent className="p-1">
        <div className="relative bg-black rounded-lg overflow-hidden">
          {/* Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full aspect-video"
            poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450"
            data-testid="video-player"
          />
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {/* Play Button Overlay (when paused) */}
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-6"
                onClick={togglePlay}
                data-testid="video-play-button"
              >
                <Play className="h-8 w-8 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-900 p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            <Progress value={progressPercentage} className="mb-2" />
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span data-testid="video-current-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipBackward}
                  data-testid="video-skip-back"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  data-testid="video-play-pause"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipForward}
                  data-testid="video-skip-forward"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  data-testid="video-mute"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  data-testid="video-fullscreen"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}