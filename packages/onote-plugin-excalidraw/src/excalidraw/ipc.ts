import { port } from "@sinm/onote-plugin/previewer";

export function readFile(uri: string) {
  return port.sendRequestAndWait("excalidraw.readFile", { uri });
}

export function writeFile(uri: string, content: string) {
  if (!uri) {
    return;
  }
  return port.sendRequestAndWait("excalidraw.saveFile", { uri, content });
}

export function getCurrentUri(): Promise<string | undefined> {
  return port.sendRequestAndWait("excalidraw.getCurrent");
}
