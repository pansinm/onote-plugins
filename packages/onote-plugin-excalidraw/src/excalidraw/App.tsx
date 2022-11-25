import React, { useRef } from "react";
import { useState, useEffect } from "react";
import { Excalidraw, exportToSvg } from "@excalidraw/excalidraw";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { Buffer } from "buffer/";

import {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { port } from "@sinm/onote-plugin/previewer";
import debounce from 'lodash/debounce'

function readFile(uri: string) {
  return port.sendRequestAndWait("excalidraw.readFile", { uri });
}

function writeFile(uri: string, content: string) {
  if (!uri) {
    return;
  }
  return port.sendRequestAndWait("excalidraw.saveFile", { uri, content });
}

function getCurrentUri(): Promise<string | undefined> {
  return port.sendRequestAndWait("excalidraw.getCurrent");
}

function isSupport(uri: string) {
  return /\.(excalidraw).svg$/.test(uri);
}

const parser = new DOMParser();

function parseAndUpdateFromSvg(api: ExcalidrawImperativeAPI, svg: string) {
  try {
    const dom = parser.parseFromString(svg, "image/svg+xml");
    const content = dom.documentElement.getAttribute("content") as string;
    const sceneData = JSON.parse(Buffer.from(content, "base64").toString());

    // forEach error
    sceneData.appState.collaborators = new Map();
    api.updateScene(sceneData)
  } catch (err) {
    api.resetScene();
  }
}

async function toSvg(api: ExcalidrawImperativeAPI) {
  console.log(api.getAppState())
  const sceneData = {
    elements: api.getSceneElements(),
    appState: api.getAppState(),
  }
  const svg = await exportToSvg({
    ...sceneData,
    files: null,
  });
  const scene = Buffer.from(
    JSON.stringify(sceneData)
  ).toString("base64");
  svg.setAttribute("content", scene);
  return svg.outerHTML;
}


const save = debounce(async (uri: string, api: ExcalidrawImperativeAPI) => {
  const svg = await toSvg(api);
  writeFile(uri, svg);
}, 3000);


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
        const svg = await readFile(uri);
        parseAndUpdateFromSvg(excalidrawRef.current!, svg);
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
          return readFile(uri);
        })
        .then((svg) => parseAndUpdateFromSvg(excalidrawRef.current!, svg));
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
        save(currentUriRef.current!, excalidrawRef.current!);
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
