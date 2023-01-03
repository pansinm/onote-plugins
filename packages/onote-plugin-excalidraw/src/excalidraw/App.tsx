import React, { useRef } from "react";
import { useEffect } from "react";
import { Buffer } from "buffer/";
import {
  Excalidraw,
  exportToSvg,
  exportToCanvas,
} from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

import {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { TunnelFactory } from "@sinm/onote-plugin/previewer";
import debounce from "lodash/debounce";
import { getCurrentUri, readFile, writeFile } from "./ipc";
import {
  embedDataToPng,
  embedDataToSvg,
  extraDataFromPng,
  extraDataFromSvg,
} from "./util";
import tunnel from "./tunnel";

function isSupport(uri: string) {
  return /\.(excalidraw).(png|svg)$/.test(uri);
}

function updateScene(api: ExcalidrawImperativeAPI, sceneData: any) {
  try {
    // forEach error
    sceneData.appState.collaborators = new Map();
    sceneData.appState.width = window.innerWidth;
    console.log(sceneData);
    api.updateScene(sceneData);
  } catch (err) {
    api.resetScene();
  }
  api.refresh();
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
  return embedSvg;
}

async function toPng(api: ExcalidrawImperativeAPI) {
  const sceneData = {
    elements: api.getSceneElements(),
    appState: api.getAppState(),
    files: null,
  };
  const canvas = await exportToCanvas(sceneData);
  const dataUri = canvas.toDataURL("image/png");
  return embedDataToPng(sceneData, dataUri);
}

const autoSave = debounce(async (uri: string, api: ExcalidrawImperativeAPI) => {
  if (/\.svg$/.test(uri)) {
    const svg = await toSvg(api);
    writeFile(uri, Buffer.from(svg).toString('base64'));
  }
  if (/\.png$/.test(uri)) {
    const png = await toPng(api);
    writeFile(uri, png.toString("base64"));
  }
}, 3000);

async function load(api: ExcalidrawImperativeAPI, uri: string) {
  if (!uri) {
    throw new Error("no file opened");
  }
  if (/\.svg$/.test(uri)) {
    const svg = await readFile(uri);
    const sceneData = extraDataFromSvg(svg.toString());
    updateScene(api, sceneData);
  }
  if (/\.png$/.test(uri)) {
    const png = await readFile(uri);
    const sceneData = extraDataFromPng(png);
    updateScene(api, sceneData);
  }
}

function App() {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
  const currentUriRef = useRef("");
  useEffect(() => {
    tunnel.on(
      "excalidraw.tabopened",
      async ({ uri }) => {
        if (!isSupport(uri) || currentUriRef.current === uri) {
          return;
        }
        currentUriRef.current = uri;
        load(excalidrawRef.current!, uri);
      }
    );
    tunnel.waitForReady().then(() => {
      tunnel.call("excalidraw.ready");
      excalidrawRef.current?.updateScene({
        elements: [],
        appState: { width: window.innerWidth },
      });
      excalidrawRef.current?.refresh();
      getCurrentUri().then((uri) => {
        currentUriRef.current = uri || "";
        if (!uri) {
          throw new Error("no file opened");
        }
        return load(excalidrawRef.current!, uri);
      });
    });
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
      // gridModeEnabled={true}
      theme={"light"}
      name="Excalidraw"
      //   renderFooter={renderFooter}
      //   renderTopRightUI={renderTopRightUI}
    />
  );
}

export default App;
