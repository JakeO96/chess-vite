import React from "react";
import MainLayout from "../components/MainLayout";

export default function HomePage() {
  return (
    <MainLayout>
      <header>
        <h1>
          TO LOGIN
        </h1>
        <a
          href="http://localhost:3000/login"
          target="_blank"
          rel="noopener noreferrer"
        >
          Log In
        </a>
      </header>
    </MainLayout>
  );
}