import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import "./ServerView.css";

interface ServerViewData {
  name: string;
  status: "online" | "offline";
  jarArgs: string;
  players: number;
  ram: number;
  logs: string;
  version: string;
}


export default function ServerView() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const [server, setServer] = useState<ServerViewData | null>(null);
  const [savedArgs, setSavedArgs] = useState("");
  const [javaArgs, setJavaArgs] = useState("");
  const [minRam, setMinRam] = useState("");
  const [maxRam, setMaxRam] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [savedVersion, setSavedVersion] = useState("");
  const [version, setVersion] = useState("");



  useEffect(() => {
    fetch(`${API_URL}/api/servers/${id}`)
      .then(res => res.json())
      .then(data => {
        setServer(data);
        setSavedArgs(data.jarArgs ?? "");
        setJavaArgs(data.jarArgs ?? "");
        setSavedVersion(data.version ?? "");
        setVersion(data.version ?? "");
        const ram = parseRam(data.jarArgs ?? "");
        setMinRam(String(ram.min));
        setMaxRam(String(ram.max));
      });
  }, [id]);


  async function applyJavaArgs() {
    const res = await fetch(`${API_URL}/api/servers/${id}/java-args`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ java_args: javaArgs })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error);
      return;
    }

    const updated = await fetch(`${API_URL}/api/servers/${id}`).then(r => r.json());
    setServer(updated);
    setSavedArgs(updated.jarArgs);
  }

  async function deleteWorld() {
    const res = await fetch(`${API_URL}/api/servers/${id}/delete-world`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!data.success) {
      alert("World could not be deleted.");
      return;
    }

    alert("World deleted successfully");
  }

  async function updateVersion() {
    const res = await fetch(`${API_URL}/api/servers/${id}/version`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error);
      return;
    }

    const updated = await fetch(`${API_URL}/api/servers/${id}`).then(r => r.json());
    setServer(updated);
    setSavedVersion(updated.version);
    setVersion(updated.version);
  }

  function parseRam(args: string) {
    const minMatch = args.match(/-Xms(\d+)([MG])/i);
    const maxMatch = args.match(/-Xmx(\d+)([MG])/i);

    const convert = (value: number, unit: string) =>
      unit.toUpperCase() === "G" ? value : value / 1024;

    return {
      min: minMatch ? convert(Number(minMatch[1]), minMatch[2]) : "",
      max: maxMatch ? convert(Number(maxMatch[1]), maxMatch[2]) : ""
    };
  }

  if (!server) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="serverview-container">        
        <div className={`server-info ${server.status}`}>
          <div className="server-header">
            <h3>{server.name}</h3>
            <span className="status-dot"></span>
          </div>

          <div className="server-stats">
            <p><strong>Players:</strong> {server.players}</p>
            <p><strong>RAM:</strong> {server.ram} GB</p>
          </div>

          <div className="server-details">
            <p><strong>Minecraft Version:</strong> {savedVersion}</p>

            <select
              className="version-dropdown"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            >
              <option value="1.12.2">1.12.2</option>
              <option value="1.16.5">1.16.5</option>
              <option value="1.17.1">1.17.1</option>
              <option value="1.18.2">1.18.2</option>
              <option value="1.19.4">1.19.4</option>
              <option value="1.20.6">1.20.6</option>
              <option value="1.21.11">1.21.11</option>
            </select>

            <button className="button" onClick={updateVersion}>
              Update Version
            </button>

            <p><strong>Saved Java Args:</strong> {savedArgs}</p>

            <input
              className="inputArgs"
              value={javaArgs}
              onChange={(e) => setJavaArgs(e.target.value)}
              placeholder="Put java args here..."
            />


            <button className="button" onClick={applyJavaArgs}>
              Apply
            </button>
          </div>

          <div className="delete-world">
            <button className="delete-button" onClick={() => setShowConfirmModal(true)}>
              Delete World
            </button>

            {showConfirmModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <p>Are you sure you want to delete the World directory?</p>

                  <button className="confirm-button" onClick={() => {
                    deleteWorld(); 
                    setShowConfirmModal(false);
                    }}
                  > 
                    Yes, delete it
                  </button>

                  <button className="cancel-button" onClick={() => setShowConfirmModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="server-logs">
          {server.logs || "No logs available"}
        </div>

      </div>
    </DashboardLayout>

  );
}
