import mainFrame from "@sinm/onote-plugin/main";
import EditorExtension from "./EditorExtension";

let excalidrawPort: MessagePort;

mainFrame.onTabActivated(({ uri }) => {
  mainFrame.sendPortEvent(excalidrawPort, "excalidraw.tabopened", { uri });
});

mainFrame.listenPortEvent("excalidraw.ready", (port) => {
  excalidrawPort = port;
});

mainFrame.registerFilePanel({
  editable: false,
  extensions: [".dio.svg", ".excalidraw.svg"],
  previewer:
    mainFrame.getPluginRootUri("@sinm/onote-plugin-excalidraw") + "/excalidraw.html",
});

mainFrame.handlePortRequest("excalidraw.getCurrent", async () => {
  return mainFrame.getActiveTab()?.uri;
});

mainFrame.handlePortRequest("excalidraw.readFile", async ({ uri }) => {
  if (uri) {
    return mainFrame.readText(uri);
  }
});

mainFrame.handlePortRequest("excalidraw.saveFile", async ({ uri, content }) => {
  if (uri) {
    const blob: Blob = await fetch(content).then((res) => res.blob());
    const buf = await blob.arrayBuffer();
    return mainFrame.writeFile(uri, new Int8Array(buf) as any);
  }
});

mainFrame.registerEditorExtension(new EditorExtension())