import * as React from "react";
import { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  Link as ChakraLink
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const RegisterPage: React.FC = () => {
  const [nickname, setNickname] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(nickname, contactNumber, password);
      navigate("/chat");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.error || "Failed to register",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Box bg="white" p={8} rounded="lg" shadow="base">
        <Stack spacing={6}>
          <Heading textAlign="center" size="xl">
            Create Account
          </Heading>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nickname</FormLabel>
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Choose a nickname"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Contact Number</FormLabel>
                <Input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Enter your contact number"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
              >
                Sign up
              </Button>
            </Stack>
          </form>
          <Text textAlign="center">
            Already have an account?{" "}
            <ChakraLink as={Link} to="/login" color="blue.500">
              Sign in
            </ChakraLink>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
};

export default RegisterPage;
