import React, { useRef } from "react";
import { useEffect } from "react";
import { Excalidraw, exportToSvg } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

import {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { port } from "@sinm/onote-plugin/previewer";
import debounce from "lodash/debounce";
import { getCurrentUri, readFile, writeFile } from "./ipc";
import { embedDataToSvg, extraDataFromSvg } from "./util";

function isSupport(uri: string) {
  return /\.(excalidraw).svg$/.test(uri);
}

function parseAndUpdateFromSvg(api: ExcalidrawImperativeAPI, svg: string) {
  try {
    const sceneData = extraDataFromSvg(svg);

    // forEach error
    sceneData.appState.collaborators = new Map();
    api.updateScene(sceneData);
  } catch (err) {
    api.resetScene();
  }
}

async function toSvg(api: ExcalidrawImperativeAPI) {
  const sceneData = {
    elements: api.getSceneElements(),
    appState: api.getAppState(),
  };
  const svg = await exportToSvg({
    ...sceneData,
    files: null,
  });
  const embedSvg = embedDataToSvg(sceneData, svg);
  return embedSvg.outerHTML;
}

const autoSave = debounce(async (uri: string, api: ExcalidrawImperativeAPI) => {
  const svg = await toSvg(api);
  writeFile(uri, svg);
}, 3000);

async function loadSvg(api: ExcalidrawImperativeAPI, uri: string) {
  if (!uri) {
    throw new Error("no file opened");
  }
  const svg = await readFile(uri);
  parseAndUpdateFromSvg(api, svg);
}

function App() {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
  const currentUriRef = useRef("");
  useEffect(() => {
    const dispose = port.handleEvent(
      "excalidraw.tabopened",
      async ({ uri }) => {
        if (!isSupport(uri) || currentUriRef.current === uri) {
          return;
        }
        currentUriRef.current = uri;
        loadSvg(excalidrawRef.current!, uri);
      }
    );
    port.ready().then(() => {
      port.sendEvent("excalidraw.ready");
      getCurrentUri()
        .then((uri) => {
          currentUriRef.current = uri || "";
          if (!uri) {
            throw new Error("no file opened");
          }
          return loadSvg(excalidrawRef.current!, uri)
        })
    });

    return () => {
      dispose();
    };
  }, []);

  return (
    <Excalidraw
      ref={excalidrawRef}
      onChange={async (
        elements: readonly ExcalidrawElement[],
        state: AppState
      ) => {
        autoSave(currentUriRef.current!, excalidrawRef.current!);
      }}
      // onPointerUpdate={(payload) => console.log(payload)}
      // onCollabButtonClick={() => window.alert("You clicked on collab button")}
      // viewModeEnabled={true}
      // zenModeEnabled={true}
      gridModeEnabled={true}
      theme={"light"}
      name="Excalidraw"
      //   renderFooter={renderFooter}
      //   renderTopRightUI={renderTopRightUI}
    />
  );
}

export default App;
