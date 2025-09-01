/// <reference types="vite/client" />

// Support des imports d'images additionnels
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.JPG' {
  const src: string;
  export default src;
}
declare module '*.JPEG' {
  const src: string;
  export default src;
}

// Constante globale injectée par Vite (voir define dans vite.config.ts)
declare const __APP_VERSION__: string;
