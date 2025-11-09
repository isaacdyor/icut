import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commands } from "../bindings";
import { useDragDrop } from "../hooks/use-drag-drop";
import { FilePreview } from "./file-preview";
import type { Asset, Track } from "../bindings";

interface EditorProps {
  projectId: number;
  assets: Asset[];
  tracks: Track[];
  onBack: () => void;
}

export function Editor({ projectId, assets, tracks, onBack }: EditorProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const timelineDropZoneRef = useRef<HTMLDivElement>(null);

  const addAssetMutation = useMutation({
    mutationFn: async (filePath: string) => {
      // TODO: Get file metadata (size, type, duration, dimensions)
      // For now, using placeholder values
      const fileSize = 0; // Will need to get actual file size
      const assetType = "video"; // Will need to detect from file extension

      const result = await commands.addAssetCommand(
        projectId,
        filePath,
        assetType,
        null, // duration_ms
        null, // width
        null, // height
        fileSize
      );

      if (result.status === "ok") {
        return result.data;
      }
      throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", projectId] });
    },
  });

  const createTrackWithClipMutation = useMutation({
    mutationFn: async (assetId: number) => {
      const result = await commands.createTrackWithClipCommand(
        projectId,
        assetId,
        "video", // For now, always create video tracks
        0 // Start at 0ms for now
      );

      if (result.status === "ok") {
        return result.data;
      }
      throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracks", projectId] });
    },
  });

  useDragDrop({
    onHover: (position) => {
      // Use document.elementFromPoint to detect which zone we're over
      const element = document.elementFromPoint(position.x, position.y);

      if (dropZoneRef.current?.contains(element)) {
        setDragActive(true);
      } else {
        setDragActive(false);
      }
    },
    onDrop: async (paths, position) => {
      setDragActive(false);

      // Use document.elementFromPoint to detect drop zone
      const element = document.elementFromPoint(position.x, position.y);

      if (dropZoneRef.current?.contains(element)) {
        // External file dropped on asset panel - import files
        for (const filePath of paths) {
          await addAssetMutation.mutateAsync(filePath);
        }
      }
    },
    onLeave: () => {
      setDragActive(false);
    },
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#0a0a0a",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #2a2a2a",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "6px 12px",
            backgroundColor: "#2a2a2a",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          ← Back to Projects
        </button>
      </div>

      {/* Top Section - Assets and Preview */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Left Panel - Assets */}
        <div
          ref={dropZoneRef}
          style={{
            width: "380px",
            backgroundColor: dragActive ? "#1a2a3a" : "#1a1a1a",
            borderRight: "1px solid #2a2a2a",
            display: "flex",
            flexDirection: "column",
            transition: "background-color 0.2s",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              padding: "12px",
              borderBottom: "1px solid #2a2a2a",
            }}
          >
            <button
              style={{
                padding: "8px 16px",
                backgroundColor: "#2a2a2a",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Media
            </button>
          </div>

          {addAssetMutation.error && (
            <div
              style={{
                margin: "12px 12px 0 12px",
                padding: "8px",
                backgroundColor: "#dc2626",
                fontSize: "11px",
                borderRadius: "4px",
              }}
            >
              {addAssetMutation.error.message}
            </div>
          )}

          {/* Assets Grid */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {assets.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  border: `2px dashed ${dragActive ? "#4a9eff" : "#2a2a2a"}`,
                  borderRadius: "8px",
                  padding: "60px 20px",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>📁</div>
                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#fff",
                  }}
                >
                  Import
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "#666",
                    lineHeight: "1.4",
                  }}
                >
                  Drag and drop videos,
                  <br />
                  photos, and audio files here
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                }}
              >
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    style={{
                      aspectRatio: "16/9",
                      backgroundColor:
                        selectedAssetId === asset.id ? "#3a3a3a" : "#2a2a2a",
                      borderRadius: "6px",
                      cursor: "pointer",
                      overflow: "hidden",
                      position: "relative",
                      border:
                        selectedAssetId === asset.id
                          ? "2px solid #4a9eff"
                          : "1px solid #2a2a2a",
                      transition: "border-color 0.2s, background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAssetId !== asset.id) {
                        e.currentTarget.style.borderColor = "#4a9eff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedAssetId !== asset.id) {
                        e.currentTarget.style.borderColor = "#2a2a2a";
                      }
                    }}
                  >
                    <FilePreview filePath={asset.file_path} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Video Preview */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#0a0a0a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              aspectRatio: "16/9",
              backgroundColor: "#000",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#444",
              fontSize: "14px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            Player
          </div>
          {/* Playback Controls Placeholder */}
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <button
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#2a2a2a",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Timeline */}
      <div
        style={{
          height: "320px",
          backgroundColor: "#151515",
          borderTop: "1px solid #2a2a2a",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "8px 16px",
            fontSize: "11px",
            color: "#888",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          Timeline
        </div>
        <div
          ref={timelineDropZoneRef}
          onClick={async () => {
            if (selectedAssetId !== null && tracks.length === 0) {
              await createTrackWithClipMutation.mutateAsync(selectedAssetId);
              setSelectedAssetId(null);
            }
          }}
          style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor:
              selectedAssetId !== null && tracks.length === 0
                ? "#1a2a3a"
                : "transparent",
            border:
              selectedAssetId !== null && tracks.length === 0
                ? "2px dashed #4a9eff"
                : "none",
            cursor:
              selectedAssetId !== null && tracks.length === 0
                ? "pointer"
                : "default",
            transition: "background-color 0.2s, border 0.2s",
          }}
        >
          {tracks.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#444",
                fontSize: "13px",
              }}
            >
              {selectedAssetId !== null
                ? "Click to add to timeline"
                : "Select an asset and click here to add it to the timeline"}
            </div>
          ) : (
            <div style={{ padding: "12px" }}>
              {tracks.map((track) => (
                <div
                  key={track.id}
                  style={{
                    marginBottom: "8px",
                    backgroundColor: "#1a1a1a",
                    borderRadius: "4px",
                    padding: "8px",
                    minHeight: "60px",
                    border: "1px solid #2a2a2a",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#888",
                      marginBottom: "4px",
                    }}
                  >
                    {track.track_type === "video" ? "Video" : "Audio"} Track{" "}
                    {track.order_index + 1}
                  </div>
                  {/* TODO: Render clips here - for now just showing track exists */}
                  <div
                    style={{
                      height: "40px",
                      backgroundColor: "#2a2a2a",
                      borderRadius: "2px",
                      display: "flex",
                      alignItems: "center",
                      padding: "0 8px",
                      fontSize: "11px",
                      color: "#ccc",
                    }}
                  >
                    Track {track.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
