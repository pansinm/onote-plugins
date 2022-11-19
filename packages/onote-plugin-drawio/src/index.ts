import path from "path";
import { ONote } from "@sinm/onote-plugin";

let clear: () => void;

export const setup = (onote: ONote) => {
  clear = onote.frames.onLoaded((frame) => {
    if (frame.url.includes("main.html")) {
      onote.frames.injectJs(frame, path.resolve(__dirname, "mainFrame.js"));
    }
  });
};

export const dispose = () => clear?.();
