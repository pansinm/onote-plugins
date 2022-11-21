import * as monaco from "monaco-editor";
import mainFrame from "@sinm/onote-plugin/main";

class CompletionItemProvider
  implements monaco.languages.CompletionItemProvider
{
  triggerCharacters = ["@"];

  resolveCompletionItem(item: monaco.languages.CompletionItem) {
    const filename = `assets/${Date.now()}.drawio.svg`;
    item.insertText = `![drawio](${filename})`;
    const activeTab = mainFrame.getActiveTab();
    if (activeTab?.uri) {
      const assetsUri = activeTab.uri.replace(/\/[^\/]+$/, `/${filename}`);
      mainFrame.writeText(assetsUri, "").then(() => {
        mainFrame.openTab(assetsUri);
      });
    }
    return item;
  }

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
          label: "插入Draw.io",
          filterText: "@drawio diagram",
          range,
        },
      ],
    };
  }
}

export default CompletionItemProvider;
