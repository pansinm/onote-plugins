import mainFrame from "@sinm/onote-plugin/main";
import Tunnel from "@sinm/onote-plugin/previewer/tunnel/Tunnel";

let imageViewerTunnel: Tunnel;

mainFrame.onTabActivated(({ uri }) => {
  if (imageViewerTunnel) {
    imageViewerTunnel.send("imageviewer.tabopened", { uri });
  }
});

mainFrame.onNewTunnel((tunnel) => {
  if (tunnel.groupId !== "image-viewer") {
    return;
  }
  imageViewerTunnel = tunnel;

  tunnel.handle("imageviewer.getCurrent", async () => {
    return mainFrame.getActiveTab()?.uri;
  });

  tunnel.handle("imageviewer.saveFile", async ({ uri, content }) => {
    if (uri) {
      console.log("imageviewer.saveFile", uri, content);
      const blob: Blob = await fetch(content).then((res) => res.blob());
      const buf = await blob.arrayBuffer();
      return mainFrame.writeFile(uri, new Int8Array(buf) as any);
    }
  });
});

mainFrame.registerFilePanel({
  editable: false,
  extensions: [".png", ".jpg", ".jpeg", ".svg", ".gif"],
  previewer:
    mainFrame.getPluginRootUri("@sinm/onote-plugin-image-viewer") +
    "/image-viewer.html",
});
