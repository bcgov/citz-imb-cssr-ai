import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { categoryLabels } from '../utils/categoryLabels';  // Ensure this variable is correctly set.
import jsPDF from 'jspdf';
import { Packer, Document, Paragraph, TextRun } from "docx"; // Import docx
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';  // Import saveAs from file-saver

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { query, results, sources } = location.state || {};

  // Recursive function to render nested values, if any
  const renderValue = (value) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <ul>
          {Object.entries(value).map(([subKey, subValue]) => (
            <li key={subKey}>
              <strong>{subKey}:</strong> {renderValue(subValue)}
            </li>
          ))}
        </ul>
      );
    }

    // Detect if the value is a URL and render it as a clickable link
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = value.match(urlRegex);
    if (matches) {
      return value.split(urlRegex).map((part, index) => {
        // If the part is a URL, render it as a link
        if (matches.includes(part)) {
          return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="source-link">
              {part}
            </a>
          );
        }
        return part; // Otherwise, render the text normally
      });
    }

    return <p>{value}</p>;
  };

  // Render the results section, showing information or a message if no results found
  const renderResults = () => {
    if (!results || results.length === 0) {
      return <p>No results found</p>;
    }

    const resultItem = results[0];

    return (
      <div>
        <h2>SaaS Solution: {query}</h2>
        
        {/* Loop through each category and render the corresponding data */}
        {Object.entries(resultItem).map(([key, value]) => (
          <div key={key} className="result-item">
            <strong>{categoryLabels[key] || key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
            {renderValue(value)}
          </div>
        ))}
        
        {/* Display sources as clickable links */}
        {sources && sources.length > 0 && (
          <div>
            <h3>Sources:</h3>
            {sources.map((source, index) => (
              <div key={index}>
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link"
                >
                  {source}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Function to generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`SaaS Solution: ${query}`, 10, 10);

    // Add results to the PDF
    let yPosition = 20;
    if (results && results.length > 0) {
      const resultItem = results[0];
      Object.entries(resultItem).forEach(([key, value], index) => {
        doc.text(`${categoryLabels[key] || key.charAt(0).toUpperCase() + key.slice(1)}: ${JSON.stringify(value)}`, 10, yPosition);
        yPosition += 10;
      });
    }

    // Add sources
    if (sources && sources.length > 0) {
      doc.text("Sources:", 10, yPosition);
      yPosition += 10;
      sources.forEach((source, index) => {
        doc.text(source, 10, yPosition);
        yPosition += 10;
      });
    }

    doc.save('result.pdf');
  };

  // Function to generate Word document
  const generateWord = () => {
    const doc = new Document();

    // Add title to the Word document
    doc.addSection({
      children: [
        new Paragraph({
          children: [
            new TextRun("SaaS Solution: " + query).bold(),
          ],
        }),
      ],
    });

    // Loop through results and add them to the Word document
    if (results && results.length > 0) {
      const resultItem = results[0];
      Object.entries(resultItem).forEach(([key, value]) => {
        doc.addSection({
          children: [
            new Paragraph({
              children: [
                new TextRun(`${categoryLabels[key] || key.charAt(0).toUpperCase() + key.slice(1)}: ${JSON.stringify(value)}`),
              ],
            }),
          ],
        });
      });
    }

    // Add sources to the Word document
    if (sources && sources.length > 0) {
      doc.addSection({
        children: [
          new Paragraph({
            children: [
              new TextRun("Sources:").bold(),
            ],
          }),
        ],
      });

      sources.forEach((source) => {
        doc.addSection({
          children: [
            new Paragraph({
              children: [
                new TextRun(source),
              ],
            }),
          ],
        });
      });
    }

    // Generate Word file and save it
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "result.docx");
    });
  };

  return (
    <div className="results-page">
      <h1>Results for: {query}</h1>
      <div className="d-flex justify-content-center mb-3">
        <button className="btn btn-light me-2" onClick={() => navigate('/')}>Back to Home</button>
        
        {/* Buttons for generating PDF and Word */}
        <button className="btn btn-primary me-2" onClick={generatePDF}>Download PDF</button>
        <button className="btn btn-success" onClick={generateWord}>Download Word</button>
      </div>
      <div>{renderResults()}</div>
    </div>
  );
}

export default ResultsPage;
