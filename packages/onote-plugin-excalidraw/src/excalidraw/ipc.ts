import { Buffer } from "buffer/";
import { port } from "@sinm/onote-plugin/previewer";

export async function readFile(uri: string) {
  const content = await port.sendRequestAndWait("excalidraw.readFile", { uri });
  return Buffer.from(content, "base64");
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
