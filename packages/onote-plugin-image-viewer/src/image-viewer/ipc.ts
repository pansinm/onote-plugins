import { Buffer } from "buffer/";
import tunnel from "./tunnel";

export async function readFile(uri: string) {
  const content = await tunnel.call("imageviewer.readFile", { uri });
  return Buffer.from(content as string, "base64");
}

export function writeFile(uri: string, content: string) {
  if (!uri) {
    return;
  }
  return tunnel.call("imageviewer.saveFile", { uri, content });
}

export function getCurrentUri(): Promise<string | undefined> {
  return tunnel.call("imageviewer.getCurrent") as Promise<any>;
}
