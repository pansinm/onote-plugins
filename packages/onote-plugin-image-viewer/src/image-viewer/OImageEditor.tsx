import React, { useCallback, useEffect, useRef } from "react";
import "tui-image-editor/dist/tui-image-editor.css";
import ImageEditor = require("tui-image-editor");
import { writeFile } from "./ipc";

interface OImageEditorProps {
  uri: string;
}

function loadBlob(url: string) {
  return new Promise<Blob>(function (resolve, reject) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.onerror = function () {
        reject("Network error.");
      };
      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject("Loading error:" + xhr.statusText);
        }
      };
      xhr.send();
    } catch (err) {
      const error = err as Error;
      reject(error.message);
    }
  });
}

function OImageEditor(props: OImageEditorProps) {
  const ref = useRef<ImageEditor>();
  const uri = props.uri.replace(/^file:/, "onote:"); //'img/sampleImage.jpg',
  let ext = uri.split(".").pop() || "png";
  ext = ext.toLowerCase() === "png" ? "png" : "jpeg";
  const basename = uri.split("/").pop() || "Image";

  const latestUriRef = useRef(uri);
  useEffect(() => {
    latestUriRef.current = uri;
  }, [uri]);

  useEffect(() => {
    uri &&
      loadBlob(uri).then((blob) => {
        const file = new File([blob], basename);
        const editorInstance = ref.current as any;
        editorInstance.getActions().main.load(file);
      });
  }, [uri]);

  useEffect(() => {
    const editor = new ImageEditor(
      document.querySelector("#tui-image-editor")!,
      {
        usageStatistics: false,
        cssMaxWidth: window.innerWidth,
        cssMaxHeight: window.innerHeight,
        includeUI: {
          initMenu: "filter",
          menuBarPosition: "bottom",
        },
        selectionStyle: {
          cornerSize: 20,
          rotatingPointOffset: 70,
        },
      }
    );
    const saveFile = () => {
      const uri = latestUriRef.current;
      const dataURL = editor.toDataURL({});
      writeFile(uri, dataURL);
    };

    document.addEventListener(
      "keydown",
      function (e) {
        if (
          (window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) &&
          e.key === "s"
        ) {
          e.preventDefault();
          saveFile();
        }
      },
      false
    );

    editor.on("objectAdded", saveFile);
    editor.on("objectMoved", saveFile);
    editor.on("objectRotated", saveFile);
    editor.on("objectScaled", saveFile);
    editor.on("undoStackChanged", saveFile);
    editor.on("redoStackChanged", saveFile);
    ref.current = editor;
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }} id="tui-image-editor" />
  );
}

export default OImageEditor;
