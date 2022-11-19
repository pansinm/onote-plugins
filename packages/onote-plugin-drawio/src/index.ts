import path from "path";
import { ONote } from "@sinm/onote-plugin";


export const setup = (onote: ONote) => {
  return onote.frames.onLoaded((frame) => {
    if (frame.url.includes("main.html")) {
      onote.frames.injectJs(frame, path.resolve(__dirname, "mainFrame.js"));
    }
  });
};
