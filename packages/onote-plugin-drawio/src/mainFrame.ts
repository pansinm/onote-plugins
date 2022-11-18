import mainFrame from "@sinm/onote-plugin/lib/mainFrame";

mainFrame.registerFilePanel({
  editable: false,
  extensions: [".dio.svg", ".drawio.svg"],
  previewer: mainFrame.getPluginRootUri('@sinm/onote-plugin-drawio') + "/drawio.html",
});

mainFrame.handlePortRequest("drawio.getCurrent", async () => {
  return mainFrame.getCurrentTabUrl();
});

mainFrame.handlePortRequest("drawio.readFile", async ({ uri }) => {
  if (uri) {
    return mainFrame.readText(uri);
  }
});
