import React from 'react'
import fonts from "../data/fontArray.json";

const FontList = () => {
    return (
      <>
        {fonts.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </>
    );
  };

const SidePanel = ({image,templateId,textOptions,handleChange,handleFile,handleSelect,addText,updateText,texts,selectedId,deleteText}) => {
  return (
    <div className="w-1/4 h-full overflow-y-scroll p-4 bg-white shadow-lg space-y-4">
    {image && (
      <div className="flex justify-between">
        <p>{templateId}</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(templateId);
            alert("Copied to clipboard");
          }}
        >
          Copy
        </button>
      </div>
    )}
    <h2 className="text-lg font-semibold">Text Options</h2>

    <label>Background:</label>
    <input
      type="file"
      accept="image/*"
      name="background"
      onChange={handleFile}
      className="w-full p-2 border rounded"
    />

    <input
      type="text"
      name="text"
      value={textOptions.text}
      onChange={handleChange}
      className="w-full p-2 border rounded"
      placeholder="Edit Text"
    />

    <label>Color:</label>
    <input
      type="color"
      name="color"
      value={textOptions.color}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />

    <label>Font Size:</label>
    <input
      type="number"
      name="fontSize"
      value={textOptions.fontSize}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    />

    <label>Text Align:</label>
    <select
      name="align"
      value={textOptions.align}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    >
      <option value="center">Center</option>
      <option value="left">Left</option>
      <option value="right">Right</option>
      <option value="justify">Justify</option>
    </select>
    <label>Vertical Align:</label>
    <select
      name="verticalAlign"
      value={textOptions.verticalAlign}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    >
      <option value="middle">Middle</option>
      <option value="top">Top</option>
      <option value="bottom">Bottom</option>
    </select>

    <label>Font Family:</label>
    <select
      name="fontFamily"
      value={textOptions.fontFamily}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    >
      <FontList />
    </select>

    <label>Font Weight:</label>
    <select
      name="fontWeight"
      value={textOptions.fontWeight}
      onChange={handleChange}
      className="w-full p-2 border rounded"
    >
      <option value="Lighter">Lighter</option>
      <option value="Normal">Normal</option>
      <option value="Bold">Bold</option>
      <option value="Bolder">Bolder</option>
    </select>

    <button
      onClick={addText}
      className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Add Text
    </button>

    {/* List of added texts */}
    <h3 className="text-md font-semibold mt-4">Added Texts</h3>
    <ul className="space-y-2">
      {texts.map((text) => (
        <li
          key={text.id}
          onClick={() => {
            handleSelect(text);
          }}
          className={`flex justify-between items-center p-2 border rounded ${
            selectedId === text.id && "border-red-800"
          }`}
        >
          <span>{text.text}</span>
          <div className="flex space-x-2">
            <button
              onClick={() => updateText(text.id)}
              className="text-blue-500 hover:underline"
            >
              Update
            </button>
            <button
              onClick={() => deleteText(text.id)}
              className="text-red-500 hover:underline"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
  )
}

export default SidePanel
