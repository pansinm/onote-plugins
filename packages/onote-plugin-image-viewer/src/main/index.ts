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
});

mainFrame.registerFilePanel({
  editable: false,
  extensions: [".png", ".jpg", ".jpeg", '.svg'],
  previewer:
    mainFrame.getPluginRootUri("@sinm/onote-plugin-image-viewer") +
    "/image-viewer.html",
});
