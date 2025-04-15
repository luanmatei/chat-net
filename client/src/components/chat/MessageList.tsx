import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { VStack, Box, Text, useToast } from "@chakra-ui/react";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderNickname: string;
  timestamp: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { socket } = useSocket();
  const { user, token } = useAuth();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_URL}/chat/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(response.data.messages);
        scrollToBottom();
      } catch (error) {
        toast({
          title: "Error fetching messages",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchMessages();
  }, [token, toast]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on("new_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket]);

  return (
    <VStack
      align="stretch"
      spacing={4}
      flex={1}
      overflowY="auto"
      p={4}
      maxH="calc(100vh - 180px)"
    >
      {messages.map((message) => (
        <Box
          key={message.id}
          alignSelf={message.senderId === user?.id ? "flex-end" : "flex-start"}
          bg={message.senderId === user?.id ? "blue.500" : "gray.100"}
          color={message.senderId === user?.id ? "white" : "black"}
          px={4}
          py={2}
          borderRadius="lg"
          maxW="70%"
        >
          {message.senderId !== user?.id && (
            <Text fontSize="sm" fontWeight="bold" mb={1}>
              {message.senderNickname}
            </Text>
          )}
          <Text>{message.content}</Text>
          <Text fontSize="xs" opacity={0.8} textAlign="right">
            {new Date(message.timestamp).toLocaleTimeString()}
          </Text>
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </VStack>
  );
};
