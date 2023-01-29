import tunnel from "./tunnel";

const iframe = document.createElement("iframe");

function isSupport(uri: string) {
  return /\.(dio|drawio).svg$/.test(uri);
}

let currentUri: string;
async function load(uri: string) {
  if (!isSupport(uri)) {
    return;
  }
  let drawIoWindow = iframe?.contentWindow;
  currentUri = uri;
  const content = await tunnel.call("drawio.readFile", { uri }).catch(() => "");
  drawIoWindow?.postMessage(
    JSON.stringify({
      action: "load",
      autosave: 1,
      xml: content,
      title: decodeURIComponent(uri.split("/").pop() || "drawio"),
      name: decodeURIComponent(uri.split("/").pop() || "drawio"),
    }),
    "*"
  );
}

tunnel.on("drawio.tabopened", async ({ uri }) => {
  load(uri);
});

window.addEventListener("message", async (evt) => {
  let drawIoWindow = iframe?.contentWindow;
  console.log(evt);
  if (evt.source !== drawIoWindow || !drawIoWindow) {
    return;
  }
  await tunnel.waitForReady();
  const msg = JSON.parse(evt.data);
  if (msg.event === "init") {
    const currentUri = await tunnel.call("drawio.getCurrent");
    load(currentUri as string);
    return;
  }
  if (msg.event === "save" || msg.event === "autosave") {
    drawIoWindow.postMessage(
      JSON.stringify({ action: "export", format: "xmlsvg", spinKey: "saving" }),
      "*"
    );
    return;
  }
  if (msg.event == "export") {
    await tunnel.call("drawio.saveFile", {
      uri: currentUri,
      content: msg.data,
    });
  }
});

iframe.src =
  "https://embed.diagrams.net/?embed=1&ui=atlas&spin=1&autosave=1&modified=unsavedChanges&proto=json";

document.body.append(iframe);
