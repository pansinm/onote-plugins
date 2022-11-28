import * as monaco from "monaco-editor";
import mainFrame, { IEditorExtension } from "@sinm/onote-plugin/main";
import CompletionItemProvider from "./CompletionProvider";

class EditorExtension implements IEditorExtension {
  active(editor: monaco.editor.IStandaloneCodeEditor) {
    const disposers: monaco.IDisposable[] = [];
    const completeDisposer = monaco.languages.registerCompletionItemProvider(
      "markdown",
      new CompletionItemProvider()
    );

    const commandDisposer = monaco.editor.registerCommand(
      "editor.excalidraw.insertDiagram",
      (accessor, model: monaco.editor.ITextModel, _range: monaco.Range) => {
        let range = _range;
        if (!range) {
          const selection = editor.getSelection();
          if (selection) {
            range = new monaco.Range(
              selection.startLineNumber,
              selection.startColumn,
              selection.endLineNumber,
              selection.endColumn
            );
          }
        }
        const currentTab = mainFrame.getActiveTab();
        if (range && currentTab) {
          console.log(range, currentTab, model);
          const assetName = `assets/${Date.now()}.excalidraw.svg`;
          const assetUri = currentTab.uri.replace(/\/[^\/]+$/, `/${assetName}`);
          mainFrame.writeText(assetUri, "").then(() => {
            mainFrame.openTab(assetUri);
          });
          model.applyEdits([
            {
              range,
              text: `![excalidraw](${assetName})`,
              forceMoveMarkers: true,
            },
          ]);
        }
      }
    );
    disposers.push(completeDisposer, commandDisposer);
    return { dispose: () => disposers.map((disposer) => disposer.dispose()) };
  }
}

export default EditorExtension;
