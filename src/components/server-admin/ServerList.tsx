import { User } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";

interface Server {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
}

interface ServerListProps {
  servers: Server[];
  onRemoveServer: (server: Server) => void;
}

export const ServerList = ({ servers, onRemoveServer }: ServerListProps) => {
  if (servers.length === 0) {
    return <div className="text-muted-foreground">No active servers found</div>;
  }

  return (
    <div className="space-y-4">
      {servers.map((server) => (
        <div
          key={server.id}
          className="flex items-center justify-between p-4 bg-card rounded-lg border"
        >
          <p className="font-medium">{server.name || 'Unnamed Server'}</p>
          <Button
            variant="destructive"
            onClick={() => onRemoveServer(server)}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
};