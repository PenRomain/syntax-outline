import * as vscode from 'vscode';

export const CONFIG_SECTION = 'syntaxOutline';
const DEFAULT_FILL_COLOR = 'rgba(12, 18, 31, 0.96)';
const MAX_FILE_SIZE_KB = 512;

export type SyntaxOutlineConfig = {
  fillColor: string;
};

export function getSyntaxOutlineConfig(): SyntaxOutlineConfig {
  const configuration = vscode.workspace.getConfiguration(CONFIG_SECTION);
  const rawFillColor = configuration.get<string>('fillColor', DEFAULT_FILL_COLOR).trim();

  return {
    fillColor: rawFillColor.length > 0 ? rawFillColor : DEFAULT_FILL_COLOR,
  };
}

export function shouldDecorateDocument(document: vscode.TextDocument): boolean {
  return document.getText().length / 1024 <= MAX_FILE_SIZE_KB;
}
