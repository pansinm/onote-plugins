import mainFrame from "@sinm/onote-plugin/main";
import {Buffer} from 'buffer/'
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
  extensions: [".excalidraw.svg", ".excalidraw.png"],
  previewer:
    mainFrame.getPluginRootUri("@sinm/onote-plugin-excalidraw") + "/excalidraw.html",
});

mainFrame.handlePortRequest("excalidraw.getCurrent", async () => {
  return mainFrame.getActiveTab()?.uri;
});

mainFrame.handlePortRequest("excalidraw.readFile", async ({ uri }) => {
  if (uri) {
    const content = await mainFrame.readFile(uri);
    return Buffer.from(content).toString('base64');
  }
  throw new Error('uri missing');
});

mainFrame.handlePortRequest("excalidraw.saveFile", async ({ uri, content }) => {
  if (uri) {
    return mainFrame.writeFile(uri, Buffer.from(content, 'base64'));
  }
});

mainFrame.registerEditorExtension(new EditorExtension())