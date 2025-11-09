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

  if (currentProjectId === null) {
    return <Dashboard projects={projects} onOpenProject={setCurrentProjectId} />;
  }

  return (
    <Editor
      projectId={currentProjectId}
      assets={assets}
      onBack={() => setCurrentProjectId(null)}
    />
  );
}

export default App;
