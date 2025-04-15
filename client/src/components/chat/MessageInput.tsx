import React, { useState, ChangeEvent } from 'react';
import { HStack, Input, Button, useToast } from '@chakra-ui/react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { socket } = useSocket();
  const { user, token } = useAuth();
  const toast = useToast();

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      // Save message to backend (for persistence)
      await axios.post(
        `${API_URL}/chat/messages`,
        { content: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Emit message to all clients via socket
      socket?.emit('send_message', {
        senderId: user?.id,
        senderNickname: user?.nickname,
        content: message,
      });
      setMessage('');
    } catch (err) {
      toast({
        title: 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <HStack>
      <Input
        placeholder="Type your message..."
        value={message}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <Button colorScheme="teal" onClick={sendMessage} disabled={!message.trim()}>
        Send
      </Button>
    </HStack>
  );
};

export default MessageInput;
