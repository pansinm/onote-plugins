import React, { useCallback, useEffect, useRef } from "react";
import { writeFile } from "./ipc";
import FileRobotImageEditor, {
  FilerobotImageEditorConfig,
  TABS,
  TOOLS,
} from "react-filerobot-image-editor";

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

function rename(uri: string, name: string) {
  return uri.split('/').slice(0, -1).concat(name).join('/')
}

function OImageEditor(props: OImageEditorProps) {
  const uri = props.uri.replace(/^file:/, "onote:"); //'img/sampleImage.jpg',
  let ext = uri.split(".").pop() || "png";
  ext = ext.toLowerCase() === "png" ? "png" : "jpeg";
  const basename = uri.split("/").pop() || "Image";
  const getCurrentImgDataFnRef = useRef()
  const latestUriRef = useRef(uri);
  useEffect(() => {
    latestUriRef.current = uri;
  }, [uri]);

  const closeImgEditor = () => {
    // setIsImgEditorShown(false);
  };

  return (
    <div style={{ width: "100%", height: "100%" }} id="tui-image-editor">
      <FileRobotImageEditor
        source={uri}
        getCurrentImgDataFnRef={getCurrentImgDataFnRef}
        savingPixelRatio={1}
        previewPixelRatio={1}
        onSave={(editedImageObject, designState) => {
          const { fullName, imageBase64 } = editedImageObject;
          if (!fullName || !imageBase64) {
            alert('不能保存' + fullName)
            return;
          }
          writeFile(rename(props.uri, fullName), imageBase64)
          console.log("saved", editedImageObject, designState);
        }}
        // onClose={closeImgEditor}
        annotationsCommon={{
          fill: "#ff0000",
          stroke: "#ff0000",
        }}
        Text={{ text: "Text" }}
        Rotate={{ angle: 90, componentType: "slider" }}
        Crop={{
          presetsItems: [
            {
              titleKey: "classicTv",
              descriptionKey: "4:3",
              ratio: 4 / 3,
              // icon: CropClassicTv, // optional, CropClassicTv is a React Function component. Possible (React Function component, string or HTML Element)
            },
            {
              titleKey: "cinemascope",
              descriptionKey: "21:9",
              ratio: 21 / 9,
              // icon: CropCinemaScope, // optional, CropCinemaScope is a React Function component.  Possible (React Function component, string or HTML Element)
            },
          ],
          presetsFolders: [
            {
              titleKey: "socialMedia", // will be translated into Social Media as backend contains this translation key
              // icon: Social, // optional, Social is a React Function component. Possible (React Function component, string or HTML Element)
              groups: [
                {
                  titleKey: "facebook",
                  items: [
                    {
                      titleKey: "profile",
                      width: 180,
                      height: 180,
                      descriptionKey: "fbProfileSize",
                    },
                    {
                      titleKey: "coverPhoto",
                      width: 820,
                      height: 312,
                      descriptionKey: "fbCoverPhotoSize",
                    },
                  ],
                },
              ],
            },
          ],
        }}
        tabsIds={Object.values(TABS)} // or {['Adjust', 'Annotate', 'Watermark']}
        defaultTabId={TABS.ANNOTATE} // or 'Annotate'
        defaultToolId={TOOLS.ARROW} // or 'Text'
      />
    </div>
  );
}

export default OImageEditor;
