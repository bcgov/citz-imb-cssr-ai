
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { categoryLabels } from '../utils/categoryLabels';

function ResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { query, results } = location.state || {}; 

    const handleExport = (format) => {
        if (format === 'PDF') {
            exportToPDF();
        } else if (format === 'Word') {
            exportToWord();
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(`Results for: ${query}`, 10, 10);
        doc.setFontSize(12);
    
        let yPosition = 20; 
    
        if (results && results.length > 0) {
            const resultItem = results[0];
            Object.entries(resultItem).forEach(([key, value]) => {
                const label = categoryLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
                doc.text(`${label}:`, 10, yPosition);
                yPosition += 10;
    
                if (typeof value === 'object' && value !== null) {
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        doc.text(`- ${subKey}: ${subValue}`, 20, yPosition);
                        yPosition += 10; 
                    });
                } else {
                   
                    const textLines = doc.splitTextToSize(value.toString(), 180); 
                    textLines.forEach(line => {
                        doc.text(line, 20, yPosition);
                        yPosition += 10; 
                    });
                }
            });
        } else {
            doc.text('No results found', 10, yPosition);
        }
    
        doc.save('results.pdf');
    };
    
    const exportToWord = () => {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: `Results for: ${query}`,
                        heading: HeadingLevel.HEADING_1,
                    }),
                ],
            }],
        });

        if (results && results.length > 0) {
            const resultItem = results[0];
            Object.entries(resultItem).forEach(([key, value]) => {
                const label = categoryLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);

                
                doc.addSection({
                    children: [
                        new Paragraph({
                            text: `${label}:`,
                            heading: HeadingLevel.HEADING_2,
                        }),
                        ...(typeof value === 'object' && value !== null
                            ? Object.entries(value).map(([subKey, subValue]) => 
                                new Paragraph(`${subKey}: ${subValue}`)
                              )
                            : [new Paragraph(value !== undefined ? value.toString() : 'No information available')]
                        ),
                    ],
                });
            });
        } else {
            doc.addSection({
                children: [
                    new Paragraph('No results found'),
                ],
            });
        }

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, 'results.docx');
        }).catch(error => {
            console.error('Error exporting to Word:', error); 
        });
    };

    const renderValue = (value) => {
        if (typeof value === 'object' && value !== null) {
            return (
                <ul>
                    {Object.entries(value).map(([subKey, subValue]) => (
                        <li key={subKey}>{subKey}: {subValue}</li>
                    ))}
                </ul>
            );
        }
        return <p>{value}</p>;
    };

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
                        <strong>{categoryLabels[key] || key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                        {renderValue(value)}
                    </div>
                ))}
                
            </div>
        );
    };

    return (
        <div className="results-page">
            <h1 className="text-center">Results for: {query}</h1>
            <div className="d-flex justify-content-center mb-3">
                <button className="btn btn-light me-2" onClick={() => navigate('/')}>Back to Main</button>
                <button className="btn btn-secondary me-2" onClick={() => handleExport('PDF')}>Export PDF</button>
                <button className="btn btn-secondary me-2" onClick={() => handleExport('Word')}>Export Word</button>
            </div>
            <div className="result-content">
                {renderResults()}
            </div>
        </div>
    );
}

export default ResultsPage;
