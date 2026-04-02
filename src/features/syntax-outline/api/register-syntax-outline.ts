import * as vscode from 'vscode';
import { collectTextRanges } from '../lib/collect-text-ranges.js';
import { createOutlineDecoration } from '../lib/create-outline-decoration.js';
import {
  CONFIG_SECTION,
  getSyntaxOutlineConfig,
  shouldDecorateDocument,
} from '../model/syntax-outline-config.js';

const REFRESH_DELAY_MS = 120;

class SyntaxOutlineController implements vscode.Disposable {
  private decorationType = createOutlineDecoration(getSyntaxOutlineConfig().fillColor);

  private readonly disposables: vscode.Disposable[] = [];

  private readonly refreshTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
          this.refreshEditors([editor]);
        }
      }),
      vscode.window.onDidChangeVisibleTextEditors((editors) => {
        this.refreshEditors(editors);
      }),
      vscode.workspace.onDidOpenTextDocument((document) => {
        this.scheduleDocumentRefresh(document);
      }),
      vscode.workspace.onDidChangeTextDocument((event) => {
        this.scheduleDocumentRefresh(event.document);
      }),
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (!event.affectsConfiguration(CONFIG_SECTION)) {
          return;
        }

        this.recreateDecorationType();
        this.refreshEditors(vscode.window.visibleTextEditors);
      }),
    );

    this.refreshEditors(vscode.window.visibleTextEditors);
  }

  public dispose(): void {
    for (const timer of this.refreshTimers.values()) {
      clearTimeout(timer);
    }

    this.refreshTimers.clear();
    this.decorationType.dispose();

    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  private recreateDecorationType(): void {
    this.decorationType.dispose();
    this.decorationType = createOutlineDecoration(getSyntaxOutlineConfig().fillColor);
  }

  private scheduleDocumentRefresh(document: vscode.TextDocument): void {
    const key = document.uri.toString();
    const activeTimer = this.refreshTimers.get(key);

    if (activeTimer) {
      clearTimeout(activeTimer);
    }

    const timer = setTimeout(() => {
      this.refreshTimers.delete(key);

      const relatedEditors = vscode.window.visibleTextEditors.filter(
        (editor) => editor.document.uri.toString() === key,
      );

      this.refreshEditors(relatedEditors);
    }, REFRESH_DELAY_MS);

    this.refreshTimers.set(key, timer);
  }

  private refreshEditors(editors: readonly vscode.TextEditor[]): void {
    for (const editor of editors) {
      this.refreshEditor(editor);
    }
  }

  private refreshEditor(editor: vscode.TextEditor): void {
    if (!shouldDecorateDocument(editor.document)) {
      editor.setDecorations(this.decorationType, []);
      return;
    }

    const ranges = collectTextRanges(editor.document);
    editor.setDecorations(this.decorationType, ranges);
  }
}

export function registerSyntaxOutline(context: vscode.ExtensionContext): void {
  context.subscriptions.push(new SyntaxOutlineController());
}
