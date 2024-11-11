import React, { useState } from "react";
import DesignPanel from "../components/DesignPanel";
import CSVHandler from "../components/CSVHandler";
import generateCertificateData from "../functions/generateCertificateData";
import CertificatePreview from "../components/CertificatePreview";

const CertificateDesignPage = () => {
  const [background, setBackground] = useState(null);
  const [image, setImage] = useState(null);
  const [texts, setTexts] = useState([]);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [keys, setKeys] = useState([]);


  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!background) {
      alert("Please Select A background");
      return;
    }

    const formData = new FormData();
    formData.append("dimensions", JSON.stringify(imageDimensions));
    formData.append("texts", JSON.stringify(texts));
    formData.append("image", background);

    try {
      const response = await fetch(
        `https://utils-backend.onrender.com/api/design/save/${templateId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.status !== 200) {
        alert("Upload Failed");
        return;
      }

      const result = await response.json();
      setTemplateId(result.data._id); // Use returned ID for future updates
      alert("Upload Successful");
    } catch (error) {
      console.error("Error uploading data:", error);
      alert("Error uploading the Data");
    }
  };

  const generateOnlineCertificates = async () => {
    if (!templateId) {
      alert("Please Select A Template");
      return;
    }

    if (data.length === 0) {
      alert("Please Upload Data");
      return;
    }

    const sentData = {
      templateId,
      dataArr: data,
    };
    await fetch("http://localhost:4000/certificate/generate-certificate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sentData),
    }).then((response) => {
      if (response.status !== 200) {
        alert("Failed to generate certificates");
        return;
      }
      alert("Certificates Generated Successfully");
    });
  };

  const generateOffline = () => {
    const template = {
      image: background,
      texts: texts,
    };
    const certData = generateCertificateData(template, data, selectedKey);
    setGenerated(certData);
  };

  return (
    <div className="no-scrollbar">
      <div className="min-h-screen no-scrollbar w-screen flex justify-between pl-10">
        <DesignPanel
          imageDimensions={imageDimensions}
          setImageDimensions={setImageDimensions}
          image={image}
          setImage={setImage}
          generateOnlineCertificates={generateOnlineCertificates}
          generateOffline={generateOffline}
          templateId={templateId}
          setTemplateId={setTemplateId}
          background={background}
          setBackground={setBackground}
          texts={texts}
          handleUpload={handleUpload}
          setTexts={setTexts}
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          keys={keys}
        />
        <CSVHandler
          setKeys={setKeys}
          data={data}
          error={error}
          setData={setData}
          setError={setError}
        />
      </div>
      {generated && (
        <div className="h-screen w-full flex justify-center p-10 scrollbar">
          <div className="scrollbar h-full w-full overflow-y-scroll">
            {generated.map((cert, index) => {
              console.log(cert.downloadKey);
              return (
                <CertificatePreview
                  image={image}
                  downloadKey={cert.downloadKey}
                  texts={cert.texts}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateDesignPage;
