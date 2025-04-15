import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import { VStack, Box, Text, Heading, Flex, Badge, Tooltip } from "@chakra-ui/react";
import { useSocket } from "../../contexts/SocketContext";

interface ActiveUser {
  userId: string;
  nickname: string;
  socketId: string;
  connectionCount: number;
}

// Interface for our consolidated user display
interface ConsolidatedUser {
  nickname: string;
  connectionCount: number;
}

export const UserList: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const { socket } = useSocket();

  // Consolidate users by nickname
  const consolidatedUsers = useMemo(() => {
    const userMap = new Map<string, ConsolidatedUser>();
    
    activeUsers.forEach(user => {
      if (!userMap.has(user.nickname)) {
        userMap.set(user.nickname, {
          nickname: user.nickname,
          connectionCount: 1
        });
      } else {
        const existing = userMap.get(user.nickname);
        if (existing) {
          existing.connectionCount += 1;
        }
      }
    });
    
    return Array.from(userMap.values());
  }, [activeUsers]);

  useEffect(() => {
    if (!socket) return;

    // Listen for active users updates
    socket.on("active_users", (users: ActiveUser[]) => {
      setActiveUsers(users);
    });

    const handleConnect = () => {
      // Optional: Explicitly request user list on connect if needed
      // socket.emit('request_active_users'); 
    };
    socket.on('connect', handleConnect);

    return () => {
      socket.off("active_users");
      socket.off('connect', handleConnect);
    };
  }, [socket]);

  return (
    <Box 
      w="250px" 
      bg="white" 
      h="100%" 
      borderLeft="1px" 
      borderColor="gray.200"
      p={4}
    >
      <Heading size="md" mb={4}>Active Users ({consolidatedUsers.length})</Heading>
      <VStack align="stretch" spacing={2}>
        {consolidatedUsers.map((user, index) => (
          <Box
            key={`${user.nickname}-${index}`}
            p={3}
            bg="gray.50"
            borderRadius="md"
            _hover={{ bg: "gray.100" }}
          >
            <Flex justify="space-between" align="center">
              <Text fontWeight="medium">
                {user.nickname}
              </Text>
              <Tooltip 
                label={user.connectionCount > 1 
                  ? `This user is currently logged in from ${user.connectionCount} different devices or browsers` 
                  : "This user is connected from one device"}
                placement="top"
                hasArrow
              >
                <Badge 
                  colorScheme={user.connectionCount > 1 ? "blue" : "gray"}
                  variant={user.connectionCount > 1 ? "solid" : "subtle"}
                  borderRadius="md" 
                  px={2} 
                  py={1}
                  fontSize="sm"
                  cursor="help"
                >
                  {user.connectionCount}X
                </Badge>
              </Tooltip>
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
