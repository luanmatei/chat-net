import * as React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Flex,
  Spinner,
  Badge,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

interface User {
  id: string;
  nickname: string;
  email: string;
  role: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const UsersPage: React.FunctionComponent = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token, user: currentUser } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fetch all users
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUsers(response.data.users);
      } catch (error: any) {
        toast({
          title: "Error loading users",
          description: error.response?.data?.error || "Failed to load user data",
          status: "error",
          duration: 3000,
          isClosable: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, toast]);

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Users Management</Heading>
        <HStack spacing={4}>
          <Button as={Link} to="/usage" colorScheme="green">
            Usage Statistics
          </Button>
          <Button as={Link} to="/chat" colorScheme="blue">
            Back to Chat
          </Button>
        </HStack>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" h="300px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box overflowX="auto">
          {users.length === 0 ? (
            <Text fontSize="lg" textAlign="center" py={8}>
              No users found.
            </Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>User ID</Th>
                  <Th>Nickname</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.id} bg={user.id === currentUser?.id ? "blue.50" : undefined}>
                    <Td>{user.id}</Td>
                    <Td fontWeight={user.id === currentUser?.id ? "bold" : "normal"}>
                      {user.nickname}
                      {user.id === currentUser?.id && (
                        <Badge ml={2} colorScheme="blue">You</Badge>
                      )}
                    </Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge colorScheme={user.role === "admin" ? "purple" : "gray"}>
                        {user.role}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme="green">Active</Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      )}
    </Container>
  );
};

export default UsersPage;
