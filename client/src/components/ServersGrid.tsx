import ServerCard from "./ServerCard";

export default function ServersGrid({ servers }: { servers: string[] }) {
  return (
    <div className="grid">
      {servers.map(name => (
        <ServerCard key={name} name={name} />
      ))}
    </div>
  );
}
