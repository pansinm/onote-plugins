import path from "path";
import { ONote } from "@sinm/onote-plugin";

export const setup = (onote: ONote) => {
  onote.frames.onLoaded((frame) => {
    if (frame.url.includes("main.html")) {
      onote.frames.injectJs(frame, path.resolve(__dirname, "mainFrame.js"));
    }

    if (frame.url.includes("drawio.html")) {
      onote.frames.injectJs(frame, path.resolve(__dirname, "mainFrame.js"));
    }
  });
};
