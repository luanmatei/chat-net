import * as React from "react";
import { Box, Flex, Button, Text, useToast } from "@chakra-ui/react";
import MessageInput from './MessageInput';
import { MessageList } from './MessageList';
import { UserList } from './UserList';
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useCallback } from "react";
import { useSocket } from "../../contexts/SocketContext";
import { useNavigate } from "react-router-dom";

export const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const toast = useToast();

  const connectUser = useCallback(() => {
    if (socket && user) {
      // Connect user to socket with their info
      socket.emit('user_connected', {
        userId: user.id,
        nickname: user.nickname
      });
    }
  }, [socket, user]);

  useEffect(() => {
    // Quando o componente montar e tivermos socket e user, conectar
    connectUser();

    // Reconectar se o socket reconectar
    if (socket) {
      socket.on('connect', () => {
        connectUser();
      });

      return () => {
        socket.off('connect');
      };
    }
  }, [socket, user, connectUser]);

  const handleLogout = () => {
    try {
      // Disconnect socket
      socket?.disconnect();
      // Clear auth state
      logout();
      // Navigate to login
      navigate("/login");
      toast({
        title: "Logged out successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex h="100vh" bg="gray.50">
      <Flex flex={1} direction="column">
        <Box p={4} bg="white" borderBottom="1px" borderColor="gray.200" display="flex" justifyContent="space-between" alignItems="center">
          <Text fontSize="lg" fontWeight="bold">Welcome, {user?.nickname}</Text>
          <Button colorScheme="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
        <MessageList />
        <Box p={4} bg="white" borderTop="1px" borderColor="gray.200">
          <MessageInput />
        </Box>
      </Flex>
      <UserList />
    </Flex>
  );
};

export default ChatPage;
