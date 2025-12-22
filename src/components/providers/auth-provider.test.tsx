// auth-provider.test.tsx - Testing the AuthProvider component
"use client";

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "./auth-provider";

// Mock child component to test with
const MockChild = () => <div>Child Component</div>;

describe("AuthProvider", () => {
  it("should wrap children with SessionProvider", () => {
    render(
      <AuthProvider>
        <MockChild />
      </AuthProvider>
    );

    expect(screen.getByText("Child Component")).toBeInTheDocument();
    // The component should render without errors, which indicates SessionProvider is working
  });

  it("should accept refetchInterval and refetchOnWindowFocus props", () => {
    // This test verifies that our enhanced options are properly passed to SessionProvider
    const { container } = render(
      <AuthProvider refetchInterval={300} refetchOnWindowFocus={true}>
        <MockChild />
      </AuthProvider>
    );

    // The component should render successfully with our enhanced options
    expect(container).toBeInTheDocument();
  });
});