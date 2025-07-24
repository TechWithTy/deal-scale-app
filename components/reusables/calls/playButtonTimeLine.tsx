import React, { useRef, useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import playAnimation from '@/public/lottie/playButton.json';

interface PlayButtonTimeLineProps {
  audioSrc: string;
  startTime: number; // Optional start time in seconds
  endTime?: number; // Optional end time in seconds
}

export const PlayButtonTimeLine = ({
  audioSrc,
  startTime = 0,
  endTime
}: PlayButtonTimeLineProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref for the audio element
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // Progress percentage (0 - 100)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [duration, setDuration] = useState(0); // Duration of the audio in seconds
  const lottieRef = useRef<any>(null); // Ref for Lottie animation control

  // Validate start and end times, ensuring positive values
  const validStartTime = Math.max(0, startTime); // Ensure startTime is at least 0
  const validEndTime = endTime && endTime > validStartTime ? endTime : null; // Ensure endTime is greater than startTime

  // Toggle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        lottieRef.current?.pause();
      } else {
        audioRef.current.play();
        lottieRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle time update (called as audio plays)
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      setProgress(
        (currentTime / (validEndTime || audioRef.current.duration)) * 100
      ); // Update progress as a percentage

      // Stop the audio if the endTime is reached
      if (validEndTime && currentTime >= validEndTime) {
        audioRef.current.pause();
        audioRef.current.currentTime = validStartTime;
        setIsPlaying(false);
        lottieRef.current?.pause(); // Pause animation
      }
    }
  };

  // Handle timeline change (when the user drags the slider)
  const handleTimelineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    setProgress(newValue);
    if (audioRef.current) {
      const newTime =
        (newValue / 100) * (validEndTime || audioRef.current.duration);
      audioRef.current.currentTime = newTime; // Update audio current time
    }
  };

  // Load audio duration when metadata is available
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(validEndTime || audioRef.current.duration); // Set to validEndTime or the full duration
      audioRef.current.currentTime = validStartTime; // Set the start time
    }
  };

  // Format time in MM:SS format
  // const formatTime = (seconds: number) => {
  //   const minutes = Math.floor(seconds / 60);
  //   const remainingSeconds = Math.floor(seconds % 60);
  //   return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  // };

  useEffect(() => {
    if (audioRef.current) {
      // Set audio to start at `validStartTime` on load
      audioRef.current.currentTime = validStartTime;
    }
  }, [validStartTime]);

  return (
    <div className="flex items-center space-x-2">
      <div
        onClick={togglePlay}
        className={`relative flex cursor-pointer items-center justify-center rounded-full p-2 transition-all duration-300 ${
          isPlaying ? 'bg-red-500/50' : 'bg-green-500'
        }`}
        style={{ height: '60px', width: '60px' }}
      >
        <Lottie
          animationData={playAnimation}
          loop={true}
          autoplay={false}
          lottieRef={lottieRef}
          style={{ height: '40px', width: '40px' }}
        />
      </div>

      {/* Timeline Slider */}
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={handleTimelineChange}
        className="w-32"
      />

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  );
};
