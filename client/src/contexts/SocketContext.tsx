import * as React from "react";
import io from 'socket.io-client'; // Import io as default
import { Socket } from 'socket.io-client'; // Import Socket as a value
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: typeof Socket | null; // Use typeof Socket as the type
}

const SocketContext = React.createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = React.useState<typeof Socket | null>(null); // Use typeof Socket
  const { user, token } = useAuth();

  React.useEffect(() => {
    // Só inicializa o socket se houver um usuário autenticado
    if (user && token) {
      console.log('Initializing socket connection...');
      // Use the imported 'io' function
      const s = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
        auth: { token },
        // Força reconexão quando o token mudar
        query: { userId: user.id }
      });

      s.on('connect', () => {
        console.log('Socket connected');
        // Emite o evento user_connected imediatamente após a conexão
        s.emit('user_connected', {
          userId: user.id,
          nickname: user.nickname
        });
      });

      setSocket(s);

      return () => {
        console.log('Disconnecting socket...');
        s.disconnect();
      };
    } else {
      // Se não houver usuário, desconecta o socket
      if (socket) {
        console.log('No user authenticated, disconnecting socket...');
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user, token]); // Dependências incluem user e token para reiniciar quando mudarem

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
