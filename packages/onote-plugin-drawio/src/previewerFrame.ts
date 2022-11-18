import { port } from "@sinm/onote-plugin/lib/previewerFrame";
import { stringify } from "querystring";

const iframe = document.createElement("iframe");

iframe.src =
  "https://embed.diagrams.net/?embed=1&ui=atlas&spin=1&modified=unsavedChanges&proto=json";

function isSupport(uri: string) {
  return /\.(dio|drawio).svg$/.test(uri);
}

async function load(uri: string) {
  if (!isSupport(uri)) {
    return;
  }
  let drawIoWindow = iframe?.contentWindow;
  const content = await port.sendRequestAndWait("drawio.readFile", { uri });
  drawIoWindow?.postMessage(
    JSON.stringify({
      action: "load",
      xmlsvg: content,
    })
  );
}

port.handleEvent("OpenedModelChanged", async ({ uri }) => {
  load(uri);
});

window.addEventListener("message", async (evt) => {
  let drawIoWindow = iframe?.contentWindow;
  if (evt.source !== drawIoWindow || !drawIoWindow) {
    return;
  }
  await port.ready();
  const msg = JSON.parse(evt.data);
  if (msg.event === "init") {
    const currentUri = await port.sendRequestAndWait("drawio.getCurrent");
    load(currentUri);
    return;
  }
  if (msg.event === "save") {
    drawIoWindow.postMessage(
      JSON.stringify({ action: "export", format: "xmlsvg", spinKey: "saving" }),
      "*"
    );
    return;
  }
  if (msg.event == "export") {
    await port.sendRequestAndWait("drawio.saveFile", {
      uri: stringify,
      content: msg.data,
    });
  }
});
