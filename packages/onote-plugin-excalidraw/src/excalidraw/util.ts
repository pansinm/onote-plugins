import { Buffer } from "buffer/";

export function embedDataToSvg(data: any, svgElement: SVGSVGElement) {
  const scene = Buffer.from(JSON.stringify(data)).toString("base64");
  svgElement.setAttribute("content", scene);
  return svgElement;
}

const parser = new DOMParser();

export function extraDataFromSvg(svg: string) {
  const dom = parser.parseFromString(svg, "image/svg+xml");
  const content = dom.documentElement.getAttribute("content") as string;
  const sceneData = JSON.parse(Buffer.from(content, "base64").toString());
  return sceneData;
}
