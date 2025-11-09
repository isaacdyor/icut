import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { commands } from "./bindings";
import { Dashboard } from "./components/dashboard";
import { Editor } from "./components/editor";
import "./App.css";

function App() {
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const result = await commands.getAllProjectsCommand();
      if (result.status === "ok") {
        return result.data;
      }
      throw new Error(result.error);
    },
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["assets", currentProjectId],
    queryFn: async () => {
      if (!currentProjectId) return [];
      const result = await commands.getAssetsCommand(currentProjectId);
      if (result.status === "ok") {
        return result.data;
      }
      throw new Error(result.error);
    },
    enabled: currentProjectId !== null,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ["tracks", currentProjectId],
    queryFn: async () => {
      if (!currentProjectId) return [];
      const result = await commands.getTracksCommand(currentProjectId);
      if (result.status === "ok") {
        return result.data;
      }
      throw new Error(result.error);
    },
    enabled: currentProjectId !== null,
  });

  const { data: clips = [] } = useQuery({
    queryKey: ["clips", currentProjectId, tracks],
    queryFn: async () => {
      if (!currentProjectId || tracks.length === 0) return [];

      const allClips = await Promise.all(
        tracks.map(async (track) => {
          const result = await commands.getClipsCommand(track.id);
          if (result.status === "ok") {
            return result.data;
          }
          return [];
        })
      );

      return allClips.flat();
    },
    enabled: currentProjectId !== null && tracks.length > 0,
  });

  if (currentProjectId === null) {
    return <Dashboard projects={projects} onOpenProject={setCurrentProjectId} />;
  }

  return (
    <Editor
      projectId={currentProjectId}
      assets={assets}
      tracks={tracks}
      clips={clips}
      onBack={() => setCurrentProjectId(null)}
    />
  );
}

export default App;
