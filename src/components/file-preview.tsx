import { convertFileSrc } from "@tauri-apps/api/core";
import { useRef, useState } from "react";

interface FilePreviewProps {
  filePath: string;
}

export function FilePreview({ filePath }: FilePreviewProps) {
  const fileName = filePath.split("/").pop() || filePath;
  const extension = fileName.split(".").pop()?.toLowerCase();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(
    extension || ""
  );
  const isVideo = ["mp4", "webm", "mov", "avi", "mkv"].includes(
    extension || ""
  );

  const assetUrl = convertFileSrc(filePath);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    videoRef.current.currentTime = videoRef.current.duration * percentage;
  };

  if (isImage) {
    return (
      <img
        src={assetUrl}
        alt={fileName}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    );
  }

  if (isVideo) {
    return (
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          cursor: isHovering ? "col-resize" : "grab",
        }}
      >
        <video
          ref={videoRef}
          src={assetUrl}
          preload="metadata"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {isHovering && (
          <div
            style={{
              position: "absolute",
              bottom: "4px",
              left: "4px",
              right: "4px",
              height: "4px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "2px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${
                  videoRef.current
                    ? (videoRef.current.currentTime /
                        videoRef.current.duration) *
                      100
                    : 0
                }%`,
                backgroundColor: "#4a9eff",
                borderRadius: "2px",
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Default: just show file extension badge
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#3a3a3a",
        fontSize: "11px",
        fontWeight: "bold",
        color: "#888",
      }}
    >
      {extension?.toUpperCase() || "FILE"}
    </div>
  );
}
