import * as monaco from "monaco-editor";

class CompletionItemProvider
  implements monaco.languages.CompletionItemProvider
{
  triggerCharacters = ["@"];

  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext,
    token: monaco.CancellationToken
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    const lineTextBefore = model
      .getLineContent(position.lineNumber)
      .substring(0, position.column);
    const startIndex = lineTextBefore.lastIndexOf("@");

    const range = new monaco.Range(
      position.lineNumber,
      startIndex + 1,
      position.lineNumber,
      position.column
    );
    if (startIndex < 0) {
      return {
        suggestions: [],
      };
    }
    return {
      suggestions: [
        {
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "",
          command: {
            id: "editor.excalidraw.insertDiagram",
            title: "插入Excalidraw(svg)",
            arguments: [model, range, "svg"],
          },
          label: "插入Excalidraw(svg)",
          filterText: "@excalidraw diagram",
          range,
        },
        {
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "",
          command: {
            id: "editor.excalidraw.insertDiagram",
            title: "插入Excalidraw(png)",
            arguments: [model, range, "png"],
          },
          label: "插入Excalidraw(png)",
          filterText: "@excalidraw diagram",
          range,
        },
      ],
    };
  }
}

export default CompletionItemProvider;
