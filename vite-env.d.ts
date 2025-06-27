/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY: string;
  // You can add definitions for other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}