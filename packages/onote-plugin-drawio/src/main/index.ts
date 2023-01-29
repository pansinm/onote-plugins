import mainFrame from "@sinm/onote-plugin/main";
import Tunnel from "@sinm/onote-plugin/previewer/tunnel/Tunnel";
import EditorExtension from "./EditorExtension";

let drawioTunnel: Tunnel | undefined;

mainFrame.onNewTunnel((tunnel) => {
  if (tunnel.groupId !== "drawio") {
    return;
  }
  drawioTunnel = tunnel;
  tunnel.handle("drawio.getCurrent", async () => {
    return mainFrame.getActiveTab()?.uri;
  });

  tunnel.handle("drawio.readFile", async ({ uri }) => {
    if (uri) {
      return mainFrame.readText(uri);
    }
  });

  tunnel.handle("drawio.saveFile", async ({ uri, content }) => {
    console.log('save======', uri, content)
    if (uri) {
      const blob: Blob = await fetch(content).then((res) => res.blob());
      const buf = await blob.arrayBuffer();
      return mainFrame.writeFile(uri, new Int8Array(buf) as any);
    }
  });
});

mainFrame.onTabActivated(({ uri }) => {
  if (!drawioTunnel?.disposed) {
    drawioTunnel?.send("drawio.tabopened", { uri });
  }
});

mainFrame.registerFilePanel({
  editable: false,
  extensions: [".drawio.svg"],
  previewer:
    mainFrame.getPluginRootUri("@sinm/onote-plugin-drawio") + "/drawio.html",
});

mainFrame.registerEditorExtension(new EditorExtension());
