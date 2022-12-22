import { Buffer } from "buffer/";
import {
  addMetadata,
  addMetadataFromBase64DataURI,
  getMetadata,
} from "meta-png";

export function embedDataToSvg(data: any, svgElement: SVGSVGElement) {
  const scene = Buffer.from(JSON.stringify(data)).toString("base64");
  svgElement.setAttribute("content", scene);
  return svgElement.outerHTML;
}

const parser = new DOMParser();

export function extraDataFromSvg(svg: string) {
  const dom = parser.parseFromString(svg, "image/svg+xml");
  const content = dom.documentElement.getAttribute("content") as string;
  const sceneData = JSON.parse(Buffer.from(content, "base64").toString());
  return sceneData;
}

export function embedDataToPng(data: any, pngDataUri: string) {
  const buf = Buffer.from(pngDataUri.split(",")[1], "base64");
  return Buffer.from(addMetadata(
    buf,
    "excalidraw",
    Buffer.from(JSON.stringify(data)).toString("base64")
  ));
}

export function extraDataFromPng(png: Buffer) {
  const base64 = getMetadata(png, "excalidraw");
  if (!base64) {
    return {};
  }
  return JSON.parse(Buffer.from(base64, "base64").toString());
}
