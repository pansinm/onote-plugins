import mainFrame from "@sinm/onote-plugin/lib/mainFrame";

let drawioPort: MessagePort;

mainFrame.onTabOpened((uri) => {
  mainFrame.sendPortEvent(drawioPort, "drawio.tabopened", { uri });
});

mainFrame.listenPortEvent("drawio.ready", (port) => {
  drawioPort = port;
});

mainFrame.registerFilePanel({
  editable: false,
  extensions: [".dio.svg", ".drawio.svg"],
  previewer:
    mainFrame.getPluginRootUri("@sinm/onote-plugin-drawio") + "/drawio.html",
});

mainFrame.handlePortRequest("drawio.getCurrent", async () => {
  return mainFrame.getCurrentTabUrl();
});

mainFrame.handlePortRequest("drawio.readFile", async ({ uri }) => {
  if (uri) {
    return mainFrame.readText(uri);
  }
});

mainFrame.handlePortRequest("drawio.saveFile", async ({ uri, content }) => {
  if (uri) {
    const blob: Blob = await fetch(content).then((res) => res.blob());
    const buf = await blob.arrayBuffer();
    return mainFrame.writeFile(uri, new Int8Array(buf) as any);
  }
});
