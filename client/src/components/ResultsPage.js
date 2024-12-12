import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf'; 

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { query, results, sources } = location.state || {};

  // Function to render values, separating the description from the sources
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
        if (matches.includes(part)) {
          return (
            <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="source-link">
              {part}
            </a>
          );
        }
        return part;
      });
    }

    return <p>{value}</p>;
  };

  // Function to display the results
  const renderResults = () => {
    if (!results || results.length === 0) {
      return <p>No results found</p>;
    }

    const resultItem = results[0];

    return (
      <div>
        <h2>SaaS Solution: {query}</h2>
        {Object.entries(resultItem).map(([key, value]) => (
          <div key={key} className="result-item">
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
            {renderValue(value)}
          </div>
        ))}

        {sources && sources.length > 0 && (
          <div>
            <h3>Sources:</h3>
            {sources.map((source, index) => (
              <p key={index} className="source-link">
                - <a href={source} target="_blank" rel="noopener noreferrer">{source}</a>
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Function to generate the PDF with the structure of renderResults
  const generatePDF = (data) => {
    const doc = new jsPDF();

    // Document title (with color and bold style)
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);  // Blue for the title
    doc.setFont('helvetica', 'bold');
    doc.text("SaaS Solution: " + query, 20, 20);  // Title in bold and blue

    let yPos = 30;  // Initial position on the Y-axis

    // Iterate through the data and add the categories to the PDF
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        doc.setFont('helvetica', 'bold');  // Bold for category titles
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); 
        doc.text(key.charAt(0).toUpperCase() + key.slice(1) + ":", 20, yPos);  // Category title
        yPos += 10;  // Space after category title

        doc.setFont('helvetica', 'normal');  // Normal for category content
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); 
        // Use maxWidth to prevent the text from going out of bounds
        const text = value.Information || value;
        doc.text(text, 20, yPos, { maxWidth: 170 });  // Category value
        yPos += (text.length / 30) * 1.1;  // Adjust height based on text length

        // If there are links in the value, make them clickable
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(urlRegex);
        if (matches) {
          matches.forEach((url) => {
            doc.setTextColor(0, 0, 255);  // Blue for links
            doc.textWithLink(url, 20, yPos, { url: url });
            yPos += 10;  // Space after link
          });
        }

        // Add a small space between categories to avoid overlap
        yPos += 10;
      }
    });

    // Sources section
    if (sources && sources.length > 0) {
      doc.setFont('helvetica', 'bold');  // Bold for the "Sources" title
      doc.setFontSize(12);
      doc.text("Sources:", 20, yPos);  // Sources category title
      yPos += 10;  // Space after "Sources" title

      // Links in blue
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 255);  // Blue for links
      sources.forEach((source, index) => {
        const linkYPos = yPos + (index * 10);
        doc.textWithLink(source, 20, linkYPos, { url: source });
      });
      yPos += 20;  // Space after links
    }

    // Save the PDF
    doc.save(query + "_report.pdf");
  };

  return (
    <div className="results-page">
      <h1>Results for: {query}</h1>
      <div className="d-flex justify-content-center mb-3">
        <button className="btn btn-light me-2" onClick={() => navigate('/')}>Back to Home</button>
        <button className="btn btn-primary me-2" onClick={() => generatePDF(results[0])}>Download PDF</button>
      </div>
      <div>{renderResults()}</div>
    </div>
  );
}

export default ResultsPage;
