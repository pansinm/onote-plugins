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

function readFile(uri: string) {
  return port.sendRequestAndWait("excalidraw.readFile", { uri });
}

function writeFile(uri: string, content: string) {
  return port.sendRequestAndWait("excalidraw.writeFile", { uri, content });
}

function isSupport(uri: string) {
  return /\.(excalidraw).svg$/.test(uri);
}

const parser = new DOMParser();

function fromSvg(api: ExcalidrawImperativeAPI, svg: string) {
  try {
    const dom = parser.parseFromString(svg, "image/svg+xml");
    const content = dom.documentElement.getAttribute("content") as string;
    const sceneData = JSON.parse(Buffer.from(content, "base64").toString());
    api.updateScene(sceneData);
  } catch (err) {
    api.resetScene();
  }
}

async function toSvg(elements: readonly ExcalidrawElement[], state: AppState) {
  const svg = await exportToSvg({
    elements: elements,
    appState: state,
    files: null,
  });
  const scene = Buffer.from(
    JSON.stringify({
      elements,
      appState: state,
    })
  ).toString("base64");
  svg.setAttribute("content", scene);
  return svg.outerHTML;
}

function App() {
  const excalidrawRef = useRef<ExcalidrawImperativeAPI>(null);
  const currentUriRef = useRef('');
  useEffect(() => {
    const dispose = port.handleEvent(
      "excalidraw.tabopened",
      async ({ uri }) => {
        currentUriRef.current = uri;
        const svg = await readFile(uri);
        fromSvg(excalidrawRef.current!, svg);
      }
    );
    return () => {
      dispose();
    };
  }, []);

  return (
    <Excalidraw
      ref={excalidrawRef}
      onChange={async (elements: readonly ExcalidrawElement[], state: AppState) => {
        const svg = await toSvg(elements, state);
        writeFile(currentUriRef.current, svg)
      }}
      // onPointerUpdate={(payload) => console.log(payload)}
      // onCollabButtonClick={() => window.alert("You clicked on collab button")}
      viewModeEnabled={true}
      zenModeEnabled={true}
      gridModeEnabled={true}
      theme={"light"}
      name="Excalidraw"
      //   renderFooter={renderFooter}
      //   renderTopRightUI={renderTopRightUI}
    />
  );
}

export default App;
