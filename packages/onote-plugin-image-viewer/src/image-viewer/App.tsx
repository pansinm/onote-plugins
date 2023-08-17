import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { getCurrentUri } from "./ipc";
import tunnel from "./tunnel";
import OImageEditor from "./OImageEditor";
const ImageEditor = require('@toast-ui/react-image-editor');

function isSupport(uri: string) {
  return /\.(png|svg|jpe?g|gif)$/i.test(uri);
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

  if (/.(png|jpe?g)/i.test(img)) {
    return <OImageEditor uri={img} />
  }
  
  return (
    <img src={img.replace(/^file:/, 'onote:')}></img>
  );
}

export default App;
