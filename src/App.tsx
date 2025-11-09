import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commands } from "./bindings";
import { useDragDrop } from "./hooks/use-drag-drop";
import "./App.css";

function App() {
  const [dragActive, setDragActive] = useState(false);
  const queryClient = useQueryClient();
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { data: files = [], error } = useQuery({
    queryKey: ["files"],
    queryFn: async () => {
      const result = await commands.getFiles();
      if (result.status === "ok") {
        return result.data;
      }
      throw new Error(result.error);
    },
  });

  const saveFileMutation = useMutation({
    mutationFn: async (filePath: string) => {
      const result = await commands.saveFile(filePath);
      if (result.status === "ok") {
        return result.data;
      }
      throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  const isOverDropZone = (x: number, y: number) => {
    if (!dropZoneRef.current) return false;
    const rect = dropZoneRef.current.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  useDragDrop({
    onHover: (position) => {
      if (isOverDropZone(position.x, position.y)) {
        setDragActive(true);
      } else {
        setDragActive(false);
      }
    },
    onDrop: async (paths, position) => {
      setDragActive(false);

      if (isOverDropZone(position.x, position.y)) {
        for (const filePath of paths) {
          await saveFileMutation.mutateAsync(filePath);
        }
      }
    },
    onLeave: () => {
      setDragActive(false);
    },
  });

  return (
    <main className="container">
      <h1>iCut - File Manager</h1>

      <div
        ref={dropZoneRef}
        className={`drop-zone ${dragActive ? "active" : ""}`}
        style={{
          border: "2px dashed #ccc",
          borderRadius: "8px",
          padding: "40px",
          textAlign: "center",
          marginBottom: "20px",
          backgroundColor: dragActive ? "#f0f0f0" : "transparent",
        }}
      >
        <p>Drag and drop files here</p>
      </div>

      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      {saveFileMutation.error && <p style={{ color: "red" }}>Error: {saveFileMutation.error.message}</p>}

      <div>
        <h2>Saved Files ({files.length})</h2>
        <ul style={{ textAlign: "left", listStyle: "none", padding: 0 }}>
          {files.map((file, index) => (
            <li
              key={index}
              style={{
                marginBottom: "8px",
                padding: "8px",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
              }}
            >
              {file.split("/").pop() || file}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default App;
