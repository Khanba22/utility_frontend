import React, { useState, useEffect, useRef } from "react";
import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import SidePanel from "./SidePanel";

const DesignPage = ({
  image,
  setImage,
  generateOffline,
  texts,
  keys,
  selectedKey,
  generateOnlineCertificates,
  setTexts,
  setSelectedKey,
  templateId,
  setTemplateId,
  setBackground,
  handleUpload,
  imageDimensions,
  setImageDimensions,
}) => {
  const [resetter, setResetter] = useState(true);
  const [textOptions, setTextOptions] = useState({
    text: "Your Text Here",
    color: "#000000",
    fontSize: 24,
    align: "center",
    fontFamily: "Arial",
    fontWeight: "normal",
    verticalAlign: "middle",
    width: 200, // Default width for wrapping
    height: 50,
  });
  const [selectedId, setSelectedId] = useState(null); // Track selected text ID for Transformer

  const stageRef = useRef();
  const transformerRef = useRef();

  // Handle text option changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTextOptions((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setTexts((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, ...textOptions } : t))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textOptions]);

  // Add new text to the canvas
  const addText = () => {
    const id = Date.now();
    setTexts((prev) => [
      ...prev,
      {
        id: id, // Unique ID for each text
        ...textOptions,
        x: imageDimensions.width / 2,
        y: imageDimensions.height / 2,
      },
    ]);
    setSelectedId(id);
    setTextOptions({
      align: "center",
      text: "Your Text Here",
      verticalAlign: "middle",
      color: "#000000",
      fontSize: 24,
      fontFamily: "Arial",
      fontWeight: "normal",
      width: 200, // Default width for wrapping
      height: 50,
    }); // Reset text input
  };

  // Update existing text properties
  const updateText = (id) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...textOptions } : t))
    );
  };

  // Delete text from the canvas
  const deleteText = (id) => {
    setTexts((prev) => prev.filter((t) => t.id !== id));
    setSelectedId(null); // Deselect when deleting
  };

  // Attach transformer to the selected text
  useEffect(() => {
    if (transformerRef.current && selectedId) {
      const selectedNode = stageRef.current.findOne(`#${selectedId}`);

      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    }
    if (selectedId == null) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, texts]); // Re-run when selectedId or texts change

  // Handle text drag and resize events
  const handleDragEnd = (e, id) => {
    const { x, y } = e.target.position();
    setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, x, y } : t)));
  };

  const handleSelect = (selectedText) => {
    setTextOptions({
      text: selectedText.text,
      width: selectedText.width,
      align: selectedText.align,
      height: selectedText.height,
      fontFamily: selectedText.fontFamily,
      fontSize: selectedText.fontSize,
      color: selectedText.color,
      fontWeight: selectedText.fontWeight,
    });
    setSelectedId(selectedText.id);
  };

  const handleTransformEnd = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    setTextOptions({
      ...textOptions,
      height: textOptions.height * scaleY,
      width: textOptions.width * scaleX,
    });
    setTexts((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              x: node.x(),
              y: node.y(),
              scaleX: 1,
              scaleY: 1,
              height: t.height * scaleY,
              width: t.width * scaleX,
            }
          : t
      )
    );
    node.scaleX(1);
    node.scaleY(1);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackground(file); // Set the selected file for upload
      const newImg = new Image();
      newImg.src = URL.createObjectURL(file);
      setImage(newImg); // Update display image
    }
  };

  const getTemplate = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/design/retrieve/${templateId}`
      );

      if (response.status !== 200) {
        alert(`${response.status} : Failed To retrieve the Template`);
        return;
      }

      const data = await response.json();

      // Set the texts from the response
      setTexts(data.texts);

      // Handle the file URL and the image object
      const file = data.image; // Assuming this is the URL of the image
      const imageObj = data.imageObj; // The object containing base64 image data

      // If the file URL is available
      if (file) {
        const img = new Image();
        img.src = file; // Set the image source to the file URL
        img.onload = () => {
          console.log(file);
        };
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
          setBackground(file);
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

  // Set canvas stage size according to image's aspect ratio
  useEffect(() => {
    if (image) {
      if (image.naturalHeight > image.naturalWidth) {
        const aspectRatio = 1 / 1.414;
        const screenHeight = window.innerHeight * (5 / 6);
        setImageDimensions({
          width: screenHeight * aspectRatio,
          height: screenHeight,
        });
      } else if (image.naturalHeight < image.naturalWidth) {
        const aspectRatio = 2560 / 1810;
        const screenHeight = window.innerHeight * (5 / 6);
        setImageDimensions({
          width: screenHeight * aspectRatio,
          height: screenHeight,
        });
      } else {
        setResetter(!resetter);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetter, image]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Side Panel */}
      <SidePanel
        addText={addText}
        templateId={templateId}
        selectedId={selectedId}
        textOptions={textOptions}
        updateText={updateText}
        texts={texts}
        image={image}
        deleteText={deleteText}
        handleChange={handleChange}
        handleFile={handleFile}
        handleSelect={handleSelect}
      />
      {/* Canvas Panel */}
      <div className="flex-1 flex flex-col justify-center overflow-y-scroll items-center bg-gray-200">
        <Stage
          ref={stageRef}
          width={imageDimensions.width}
          height={imageDimensions.height}
          style={{ border: "1px solid #ddd", backgroundColor: "white" }}
          onMouseDown={(e) => {
            // Deselect text when clicking outside
            if (e.target === e.target.getStage()) {
              setSelectedId(null);
            }
          }}
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
                onClick={() => handleSelect(text)}
                onTap={() => handleSelect(text)}
                onDragEnd={(e) => handleDragEnd(e, text.id)} // Handle drag end event
                onTransformEnd={(e) => handleTransformEnd(e, text.id)} // Handle transform end event
              />
            ))}

            {/* Transformer for resizing text */}
            <Transformer
              anchorCornerRadius={10}
              anchorFill="white"
              ref={transformerRef}
            />
          </Layer>
        </Stage>
        {!image ? (
          <>
            <label>Enter Template Id To Import</label>
            <input
              type="text"
              name="templateId"
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value);
              }}
              className="w-2/6 p-2 border rounded"
            />
            <button
              onClick={getTemplate}
              className="w-1/6 my-3 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Import
            </button>
          </>
        ) : (
          <button
            onClick={handleUpload}
            className="w-1/6 my-3 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        )}
        <button
          onClick={generateOffline}
          className="w-1/6 my-3 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate Offline
        </button>
        <button
          onClick={generateOnlineCertificates}
          className="w-1/6 my-3 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate Online
        </button>
        <h2>Select Download Key</h2>
        <div className="flex w-full justify-center">
          {keys && (
            <select
              onChange={(e) => setSelectedKey(e.target.value)}
              value={selectedKey}
              className="w-1/6 mb-10 p-2  border rounded"
            >
              {keys.map((key) => (
                <option
                  className={`m-3 p-2 ${
                    key === selectedKey ? "bg-blue-500" : "bg-green-500"
                  } text-white rounded hover:bg-blue-600`}
                >
                  {key}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignPage;
