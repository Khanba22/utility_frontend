import React from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

function CSVHandler({ error, setError, data, setData, setKeys }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.type;

    // Clear previous data and error
    setData([]);
    setError("");

    if (fileType === "text/csv") {
      parseCSV(file);
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      parseXLSX(file);
    } else {
      setError("Please upload a valid CSV or XLSX file.");
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setKeys(Object.keys(results.data[0]));
        setData(results.data);
      },
      error: (err) => {
        setError(err.message);
      },
    });
  };

  const parseXLSX = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" }); // Use 'array' for the read type
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Create an array of objects
      const headers = jsonData[0];
      const rows = jsonData.slice(1);
      const objects = rows.map((row) => {
        return headers.reduce((acc, header, index) => {
          acc[header] = row[index];
          return acc;
        }, {});
      });
      setKeys(Object.keys(objects[0]));
      setData(objects);
    };

    reader.onerror = (err) => {
      setError(err.message);
    };

    reader.readAsArrayBuffer(file); // Use readAsArrayBuffer instead of readAsBinaryString
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center w-1/6 p-4 bg-gray-100">
      <h1 className="mb-4 text-2xl font-bold">Upload CSV or XLSX File</h1>
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      {error && <p className="text-red-500">{error}</p>}
      <h2 className="text-xl font-semibold">Parsed Data</h2>

      <div className="w-full overflow-y-scroll">
        {data.length > 0 && (
          <div className="w-full max-w-md">
            <ul className="bg-white overflow-y-scroll shadow rounded-lg divide-y divide-gray-200">
              {data.map((item, index) => (
                <li key={index} className="p-4">
                  {Object.keys(item).map((key) => (
                    <p className="text-xs">
                      {key} - {item[key]}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default CSVHandler;
