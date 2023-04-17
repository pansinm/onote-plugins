import React, { useRef, useState } from "react";
import { useEffect } from "react";

import { getCurrentUri } from "./ipc";
import tunnel from "./tunnel";

function isSupport(uri: string) {
  return /\.(png|svg|jpe?g)$/.test(uri);
}


function App() {
  const [img, setImg] = useState('')
  useEffect(() => {
    tunnel.on(
      "imageviewer.tabopened",
      async ({ uri }) => {
        if (!isSupport(uri)) {
          return;
        }
        setImg(uri)
      }
    );
    tunnel.waitForReady().then(() => {
      tunnel.call("imgviewer.ready");
      getCurrentUri().then((uri) => {
        if (!uri) {
          throw new Error("no file opened");
        }
        return setImg(uri);
      });
    });
  }, []);

  return (
    <img src={img}></img>
  );
}

export default App;
