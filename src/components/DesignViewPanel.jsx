import React, { useState, useRef } from "react";
import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import { jsPDF } from "jspdf";

const DesignViewPanel = () => {
  const [texts, setTexts] = useState([]);
  const stageRef = useRef();
  const transformerRef = useRef();
  const [image, setImage] = useState(null);
  const [dataId, setDataId] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const fetchCertificate = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/certificate/retrieve/${dataId}`
      );
      const data = await response.json();
      console.log(data);
      // Set the texts from the response
      setTexts(data.texts);
      if (!data.dimensions) {
        alert("Failed To Retrieve");
        return;
      }
      setImageDimensions(data.dimensions);

      if (data.id) {
        setDataId(data.id);
      }

      // Handle the file URL and the image object
      const file = data.image; // Assuming this is the URL of the image
      const imageObj = data.imageObj; // The object containing base64 image data

      // If the file URL is available
      if (file) {
        const img = new Image();
        img.src = file; // Set the image source to the file URL
      }
      // If the image object exists
      if (imageObj) {
        const { content, type } = imageObj;

        // Convert base64 to Blob
        const byteCharacters = atob(content); // Decode base64 string
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        // Create a Blob from the byte array
        const blob = new Blob([byteArray], { type });
        // Create a File object from the Blob
        const file = new File([blob], "downloaded-image.png", { type });
        if (file) {
          const image = new Image();
          image.src = URL.createObjectURL(file);
          setImage(image); // Assuming setImage is a hook to store the image
        }
      }
    } catch (error) {
      console.error("Error retrieving data:", error);
      alert("Failed To Retrieve");
    }
  };


  const downloadPDF = async () => {
    const stage = stageRef.current;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [stage.width(), stage.height()],
    });

    stage.toDataURL({
      mimeType: "image/png",
      callback: (dataUrl) => {
        pdf.addImage(dataUrl, "PNG", 0, 0, stage.width(), stage.height());
        pdf.save(`${dataId}.pdf`);
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {image && (
        <div
          className="flex-1 flex h-screen w-screen justify-center items-center bg-gray-200"
        >
          <Stage
            ref={stageRef}
            width={imageDimensions.width}
            height={imageDimensions.height}
            style={{ border: "1px solid #ddd", backgroundColor: "white" }}
          >
            <Layer>
              <KonvaImage
                image={image}
                width={imageDimensions.width}
                height={imageDimensions.height}
              />

              {texts.map((text) => (
                <Text
                  verticalAlign={text.verticalAlign}
                  align={text.align}
                  key={text.id}
                  id={text.id.toString()}
                  text={text.text}
                  fontSize={text.fontSize}
                  fontFamily={text.fontFamily}
                  fill={text.color}
                  fontStyle={text.fontWeight}
                  x={text.x}
                  y={text.y}
                  height={text.height}
                  width={text.width}
                />
              ))}
              <Transformer
                anchorCornerRadius={10}
                anchorFill="white"
                ref={transformerRef}
              />
            </Layer>
          </Stage>
        </div>
      )}
      {!image && (
        <div className="flex-1 flex justify-center items-center bg-gray-300">
          <label htmlFor="">Enter Certificate Id</label>
          <input
            type="text"
            onChange={(e) => {
              setDataId(e.target.value);
            }}
            value={dataId}
          />
          <button onClick={fetchCertificate}>Fetch Certificate</button>
        </div>
      )}
      <div className="p-4">
        <button
          onClick={downloadPDF}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
};

export default DesignViewPanel;
