import jsPDF from "jspdf";
import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { Stage, Layer, Text, Image as KonvaImage } from "react-konva";

function CertificatePreview({ texts, image , downloadKey }) {
  const stageRef = useRef();
  const [imageDimensions, setImageDimensions] = useState({});

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
        pdf.save(`${downloadKey || "Certificate"}.pdf`);
      },
    });
  };

  useEffect(() => {
    if (image) {
      const aspectRatio = 2560 / 1810;
      const screenHeight = window.innerHeight * (5 / 6);
      setImageDimensions({
        width: screenHeight * aspectRatio,
        height: screenHeight,
      });
    }
  }, [image]);
  return (
    <div className="w-full flex items-center justify-evenly">
      <Stage
        ref={stageRef}
        width={imageDimensions.width}
        height={imageDimensions.height}
        style={{ border: "1px solid #ddd", backgroundColor: "white" , margin:"10px" }}
      >
        <Layer>
          {/* Background Template Image */}
          <KonvaImage
            image={image}
            width={imageDimensions.width}
            height={imageDimensions.height}
          />
          {/* Render all added text elements */}
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
              draggable
              x={text.x}
              y={text.y}
              height={text.height}
              width={text.width}
            />
          ))}
        </Layer>
      </Stage>
      <button className="w-1/6 my-3 h-16 p-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={downloadPDF}>Download {downloadKey}</button>
    </div>
  );
}

export default CertificatePreview;
