const generateCertificateData = (template, dataArr, downloadKey) => {
  const certs = [];

  dataArr.forEach((certificate) => {
    console.log(certificate[downloadKey])
    const certHardCopy = JSON.parse(JSON.stringify(template)); // Deep copy to prevent mutation of original template
    const { _id, ...certTemplate } = certHardCopy; // Destructure _id from certHardCopy
    certTemplate.texts.forEach((textObj) => {
      textObj.text = textObj.text.replace(/{(.*?)}/g, (_, key) => {
        // Use bracket notation to access properties with spaces
        return certificate[key.trim()] || `{${key}}`;
      });
    });

    certs.push({ ...certTemplate, downloadKey: certificate[downloadKey] }); // Push the modified certTemplate for this certificate
  });

  return certs;
};

export default generateCertificateData;
