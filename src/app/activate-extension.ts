import * as vscode from 'vscode';
import { registerSyntaxOutline } from '../features/syntax-outline/api/register-syntax-outline.js';

export function activateExtension(context: vscode.ExtensionContext): void {
  registerSyntaxOutline(context);
}

export function deactivateExtension(): void {}
