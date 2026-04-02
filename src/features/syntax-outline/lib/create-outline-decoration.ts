import * as vscode from 'vscode';

const OUTLINE_STROKE_WIDTH = '1.6px';
const OUTLINE_LETTER_SPACING = '0.55px';
const OUTLINE_FONT_WEIGHT = '800';

function createTextDecoration(fillColor: string): string {
  return [
    'none',
    `-webkit-text-stroke-width: ${OUTLINE_STROKE_WIDTH}`,
    '-webkit-text-stroke-color: currentColor',
    `-webkit-text-fill-color: ${fillColor}`,
    'paint-order: stroke fill',
  ].join('; ');
}

export function createOutlineDecoration(
  fillColor: string,
): vscode.TextEditorDecorationType {
  return vscode.window.createTextEditorDecorationType({
    fontWeight: OUTLINE_FONT_WEIGHT,
    letterSpacing: OUTLINE_LETTER_SPACING,
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    textDecoration: createTextDecoration(fillColor),
  });
}
