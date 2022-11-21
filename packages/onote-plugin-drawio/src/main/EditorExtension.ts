import * as monaco from "monaco-editor";
import { IEditorExtension } from "@sinm/onote-plugin/main";
import CompletionItemProvider from "./CompletionProvider";

class EditorExtension implements IEditorExtension {
  disposer?: monaco.IDisposable;
  active(editor: any): void {
    this.disposer = monaco.languages.registerCompletionItemProvider(
      "markdown",
      new CompletionItemProvider()
    );
  }

  dispose(): void {
    this.disposer?.dispose();
  }
}

export default EditorExtension;
