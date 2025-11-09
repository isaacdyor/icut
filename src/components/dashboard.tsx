import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commands } from "../bindings";
import type { Project } from "../bindings";

interface DashboardProps {
  projects: Project[];
  onOpenProject: (projectId: number) => void;
}

export function Dashboard({ projects, onOpenProject }: DashboardProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (name: string) => {
      const result = await commands.createProjectCommand(name, null, null, null);
      if (result.status === "ok") {
        return result.data;
      }
      throw new Error(result.error);
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowCreateDialog(false);
      setProjectName("");
      onOpenProject(project.id);
    },
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      createProjectMutation.mutate(projectName.trim());
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#0a0a0a",
        color: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "24px 32px",
          borderBottom: "1px solid #2a2a2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>Projects</h1>
        <button
          onClick={() => setShowCreateDialog(true)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4a9eff",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          + New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px",
        }}
      >
        {projects.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎬</div>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: "500" }}>
              No projects yet
            </h2>
            <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#666" }}>
              Create your first project to get started
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4a9eff",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              + New Project
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                style={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "8px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#4a9eff";
                  e.currentTarget.style.backgroundColor = "#1f1f1f";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2a2a2a";
                  e.currentTarget.style.backgroundColor = "#1a1a1a";
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    backgroundColor: "#0a0a0a",
                    borderRadius: "4px",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                  }}
                >
                  🎬
                </div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "500" }}>
                  {project.name}
                </h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                  {project.resolution_width}x{project.resolution_height} • {project.frame_rate}fps
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#555" }}>
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      {showCreateDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateDialog(false)}
        >
          <div
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "8px",
              padding: "24px",
              width: "400px",
              maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600" }}>
              Create New Project
            </h2>
            <form onSubmit={handleCreateProject}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", color: "#ccc" }}>
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Video"
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#0a0a0a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "4px",
                  color: "#fff",
                  fontSize: "14px",
                  marginBottom: "20px",
                  outline: "none",
                }}
              />
              {createProjectMutation.error && (
                <div style={{ marginBottom: "16px", padding: "8px", backgroundColor: "#dc2626", fontSize: "12px", borderRadius: "4px" }}>
                  {createProjectMutation.error.message}
                </div>
              )}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#2a2a2a",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!projectName.trim() || createProjectMutation.isPending}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: projectName.trim() ? "#4a9eff" : "#2a2a2a",
                    border: "none",
                    borderRadius: "6px",
                    color: projectName.trim() ? "#fff" : "#666",
                    fontSize: "14px",
                    cursor: projectName.trim() ? "pointer" : "not-allowed",
                  }}
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
