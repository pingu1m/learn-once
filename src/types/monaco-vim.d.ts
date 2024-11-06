declare module "monaco-vim" {
  export function initVimMode(
    editor: any,
    statusElement: any,
  ): {
    dispose: () => void;
  };
}
