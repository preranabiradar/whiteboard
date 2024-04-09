import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";

import Whiteboard from "./Whiteboard";
import ImageUpload from "./ImageUpload";
import FileDisplay from "./FileDisplay";

import "./SignLogin.css";

function SignLog() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const emailRegex = /\S+@\S+\.\S+/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      setAuthenticated(true);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Authentication failed:", error.message);
    }
  };

  if (authenticated) {
    return (
      <div>
        <FileDisplay />
        <ImageUpload />
        <Whiteboard />
      </div>
    );
  }
  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={6}>
          <h2 className="text-center mb-4">
            {isSignup ? "Sign Up" : "Log In"}
          </h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password:</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              {isSignup ? "Sign Up" : "Log In"}
            </Button>
          </Form>
          <p className="text-center mt-3">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account yet?"}{" "}
            <Button variant="link" onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? "Log In" : "Sign Up"}
            </Button>
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default SignLog;
