import mainFrame from "@sinm/onote-plugin/main";
import Tunnel from "@sinm/onote-plugin/previewer/tunnel/Tunnel";
import { Buffer } from "buffer/";
import EditorExtension from "./EditorExtension";

let excalidrawTunnel: Tunnel;

mainFrame.onTabActivated(({ uri }) => {
  if (excalidrawTunnel) {
    excalidrawTunnel.send("excalidraw.tabopened", { uri });
  }
});

mainFrame.onNewTunnel((tunnel) => {
  if (tunnel.groupId !== "excalidraw") {
    return;
  }
  excalidrawTunnel = tunnel;

  tunnel.handle("excalidraw.getCurrent", async () => {
    return mainFrame.getActiveTab()?.uri;
  });

  tunnel.handle("excalidraw.readFile", async ({ uri }) => {
    if (uri) {
      const content = await mainFrame.readFile(uri);
      return Buffer.from(content).toString("base64");
    }
    throw new Error("uri missing");
  });

  tunnel.handle("excalidraw.saveFile", async ({ uri, content }) => {
    if (uri) {
      return mainFrame.writeFile(uri, Buffer.from(content, "base64"));
    }
  });
});

mainFrame.registerFilePanel({
  editable: false,
  extensions: [".excalidraw.svg", ".excalidraw.png"],
  previewer:
    mainFrame.getPluginRootUri("@sinm/onote-plugin-excalidraw") +
    "/excalidraw.html",
});

mainFrame.registerEditorExtension(new EditorExtension());
