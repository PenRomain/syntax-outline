# Syntax Outline

Outline editor text with each token's current syntax color directly inside the VS Code editor.

## Why

Syntax Outline keeps the active syntax color as the contour of each token and lets you optionally replace the inner fill. The result feels like stroked typography without replacing your theme.

## Features

- Styles all non-whitespace text in the active editor.
- Uses the token's current syntax color as the outline.
- Lets you override the inner fill color with a single setting.

## Settings

```json
{
  "syntaxOutline.fillColor": "rgba(12, 18, 31, 0.96)"
}
```

Set `syntaxOutline.fillColor` to a hex, rgb, hsl, or rgba value if you want a custom inner color:

```json
{
  "syntaxOutline.fillColor": "rgba(12, 18, 31, 0.96)"
}
```

## Limits

- This extension uses `TextEditorDecorationType`, not a custom text renderer.
- The effect is applied to all non-whitespace text segments, including comments and strings.
