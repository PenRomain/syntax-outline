import * as vscode from 'vscode';

const NON_WHITESPACE_PATTERN = /\S+/g;

export function collectTextRanges(document: vscode.TextDocument): vscode.Range[] {
  const text = document.getText();
  const ranges: vscode.Range[] = [];

  for (const match of text.matchAll(NON_WHITESPACE_PATTERN)) {
    const startOffset = match.index;
    const value = match[0];

    if (startOffset === undefined) {
      continue;
    }

    ranges.push(
      new vscode.Range(
        document.positionAt(startOffset),
        document.positionAt(startOffset + value.length),
      ),
    );
  }

  return ranges;
}
