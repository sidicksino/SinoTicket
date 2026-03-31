import Hls from "hls.js";
import { useEffect, useRef } from "react";

interface HLSVideoProps {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function HLSVideo({ src, poster, className, style }: HLSVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari/iOS native HLS support
      video.src = src;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
      };
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      className={className}
      style={style}
      autoPlay
      loop
      muted
      playsInline
    />
  );
}
