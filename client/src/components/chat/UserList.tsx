import * as React from "react";
import { useEffect, useState } from "react";
import { VStack, Box, Text, Heading, Flex, Badge, Tooltip } from "@chakra-ui/react";
import { useSocket } from "../../contexts/SocketContext";

interface ActiveUser {
  userId: string;
  nickname: string;
  socketId: string;
  connectionCount: number;
}

export const UserList: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for active users updates
    socket.on("active_users", (users: ActiveUser[]) => {
      console.log("Received active users:", users);
      setActiveUsers(users);
    });

    return () => {
      socket.off("active_users");
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
      <Heading size="md" mb={4}>Active Users ({activeUsers.length})</Heading>
      <VStack align="stretch" spacing={2}>
        {activeUsers.map((user) => (
          <Box
            key={user.userId}
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
                  ? `Connected from ${user.connectionCount} different devices or browsers` 
                  : "Connected from one device"}
                placement="top"
                hasArrow
              >
                <Badge 
                  colorScheme={user.connectionCount > 1 ? "blue" : "gray"}
                  variant={user.connectionCount > 1 ? "solid" : "subtle"}
                  borderRadius="md" 
                  px={2} 
                  py={1}
                  fontSize="xs"
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
