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
          command: {id: 'editor.drawio.insertDiagram', title: '插入 Draw.io 图表', arguments: [model, range]},
          label: "插入 Draw.io 图表",
          filterText: "@drawio diagram",
          range,
        },
      ],
    };
  }
}

export default CompletionItemProvider;
