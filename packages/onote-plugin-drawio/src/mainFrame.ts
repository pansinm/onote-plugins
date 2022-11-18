import mainFrame from "@sinm/onote-plugin/lib/mainFrame";

mainFrame.registerFilePanel({
  editable: false,
  extensions: [".dio.svg", ".drawio.svg"],
  previewer: "__DIRNAME/../drawio.html",
});


mainFrame.handlePortRequest("drawio.getCurrent", async () => {
    return mainFrame.getCurrentTabUrl();
});


mainFrame.handlePortRequest("drawio.readFile", async ({ uri }) => {
  if (uri) {
    return mainFrame.readText(uri);
  }
});
