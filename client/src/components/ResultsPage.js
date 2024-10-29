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
        // ... (mantén el código de exportación sin cambios)
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
                        <p>{value}</p>
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