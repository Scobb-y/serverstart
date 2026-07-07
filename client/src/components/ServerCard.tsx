import { startServer } from "../api/client";

interface ServerCardProps {
  name: string;
}

export default function ServerCard({ name }: ServerCardProps) {
  async function handleStart() {
    try {
      await startServer(name);
      console.log(`Started server: ${name}`);
    } catch (err) {
      console.error("Failed to start server:", err);
    }
  }

  return (
    <div className="server-card">
      <h3>{name}</h3>

      <button onClick={handleStart}>Start</button>

      <style>{`
        .server-card {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #ddd;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        button {
          padding: 0.5rem 1rem;
          border: none;
          background: #4caf50;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }

        button:hover {
          background: #45a049;
        }
      `}</style>
    </div>
  );
}

