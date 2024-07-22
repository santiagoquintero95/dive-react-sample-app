import React, { Component } from "react";
import IDVC from "@idscan/idvc2";
import "@idscan/idvc2/dist/css/idvc.css";

class App extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    let idvc = new IDVC({
      el: "videoCapturingEl",
      licenseKey: process.env.REACT_APP_LICENSE_KEY,
      networkUrl: "networks",
      chunkPublicPath: "networks",
      resizeUploadedImage: 1200,
      fixFrontOrientAfterUpload: false,
      autoContinue: true,
      isShowDocumentTypeSelect: false,
      useCDN: false,
      isShowGuidelinesButton: false,
      isSubmitMetaData: false,
      useHeic: false,
      showSubmitBtn: false,
      hideDocumentTitle: false,
      language: "en",
      realFaceMode: "auto",
      modalPosition: "top",
      processingImageFormat: "jpeg",
      documentTypes: [
        {
          type: "ID",
          steps: [
            {
              type: "front",
              name: "Document Front",
            },
            {
              type: "pdf",
              name: "Document Back",
            },
            {
              type: "face",
              name: "Face",
            },
          ],
        },
        {
          type: "Passport",
          steps: [
            {
              type: "mrz",
              name: "Passport Front",
            },
            {
              type: "face",
              name: "Face",
            },
          ],
        },
        {
          type: "PassportCard",
          steps: [
            {
              type: "front",
              name: "Passport Card Front",
            },
            {
              type: "mrz",
              name: "Passport Card Back",
            },
            {
              type: "face",
              name: "Face",
            },
          ],
        },

        {
          type: "InternationalId",
          steps: [
            {
              type: "front",
              name: "International ID Front",
            },
            {
              type: "mrz",
              name: "International ID Back",
            },
            {
              type: "face",
              name: "Face",
            },
          ],
        },
      ],
      onChange(data) {
        console.log("on change", data);
      },
      onCameraError(data) {
        console.log("camera error", data);
      },
      onReset(data) {
        console.log("on reset", data);
      },
      onRetakeHook(data) {
        console.log("retake hook", data);
      },
      clickGuidlines() {
        console.log("click Guidelines");
      },
      submit(data) {
        idvc.showSpinner(true);
        let frontStep, pdfStep, faceStep, mrzStep, photoStep, barcodeStep;
        let frontImage, backImage, faceImage, photoImage, barcodeImage;
        let captureMethod;
        let rawTrackString;

        switch (data.documentType) {
          // Drivers License and Identification Card
          case 1:
            frontStep = data.steps.find((item) => item.type === "front");
            pdfStep = data.steps.find((item) => item.type === "pdf");
            faceStep = data.steps.find((item) => item.type === "face");

            frontImage = frontStep.img.split(/:image\/(jpeg|png);base64,/)[2];
            backImage = pdfStep.img.split(/:image\/(jpeg|png);base64,/)[2];
            faceImage = faceStep.img.split(/:image\/(jpeg|png);base64,/)[2];

            rawTrackString =
              pdfStep && pdfStep.trackString ? pdfStep.trackString : "";

            captureMethod =
              JSON.stringify(+frontStep.isAuto) +
              JSON.stringify(+pdfStep.isAuto) +
              JSON.stringify(+faceStep.isAuto);

            break;
          // US and International Passports
          case 2:
            mrzStep = data.steps.find((item) => item.type === "mrz");
            faceStep = data.steps.find((item) => item.type === "face");

            frontImage = mrzStep.img.split(/:image\/(jpeg|png);base64,/)[2];
            faceImage = faceStep.img.split(/:image\/(jpeg|png);base64,/)[2];

            rawTrackString = mrzStep && mrzStep.mrzText ? mrzStep.mrzText : "";

            captureMethod =
              JSON.stringify(+mrzStep.isAuto) +
              JSON.stringify(+faceStep.isAuto);

            break;
          default:
        }

        const trackStringArray = rawTrackString.split(".");
        let trackString = trackStringArray[0];
        let barcodeParams = trackStringArray[1];

        let request = {
          frontImageBase64: frontImage,
          backOrSecondImageBase64: backImage,
          faceImageBase64: faceImage,
          documentType: data.documentType,
          trackString: {
            data: trackString,
            barcodeParams: barcodeParams,
          },
          overriddenSettings: {
            isOCREnabled: true,
            isBackOrSecondImageProcessingEnabled: true,
            isFaceMatchEnabled: true,
          },
          metadata: {
            captureMethod: captureMethod,
          },
        };

        fetch("https://dvs2.idware.net/api/v4/verify", {
          method: "POST",
          headers: {
            Authorization: "Bearer " + process.env.REACT_APP_SECRET_KEY,
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(request),
        })
          .then((response) => response.json())
          .then((data) => {
            idvc.showSpinner(false);
            console.log(data);
          })
          .catch((err) => {
            idvc.showSpinner(false);
            console.log(err);
          });
      },
    });
  }

  render() {
    return (
      <div>
        <h3>DVS Demo Application</h3>
        <div id="videoCapturingEl"></div>
      </div>
    );
  }
}

export default App;