/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
