import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryLabels } from '../utils/categoryLabels'; 
function SearchForm() {
    const [query, setQuery] = useState('');
    const [categories, setCategories] = useState({
        description: false,
        applicability: false,
        compliance_and_certifications: false,
        access_control: false,
        authentication: false,
        security_awareness: false,
        log_generation: false,
        investigations_support: false,
        development_and_vulnerability: false,
        business_continuity: false,
        incident_response: false,
        breach_notifications: false,
        selectAll: false,
    });
    const navigate = useNavigate();

    const handleCategoryChange = (e) => {
        const { name, checked } = e.target;

        if (name === 'selectAll') {
            setCategories(prev => Object.keys(prev).reduce((acc, key) => {
                acc[key] = checked;
                return acc;
            }, {}));
        } else {
            setCategories(prev => ({
                ...prev,
                [name]: checked,
                selectAll: false,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, categories }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data && data.results) {
                navigate('/results', { state: { query, results: data.results } });
            } else {
                console.error('No results found');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="search-form">
            <div className="form-group">
                <label>Enter the SaaS Solution Name:</label>
                <input 
                    type="text" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="e.g. Salesforce" 
                    required 
                />
            </div>
            <div className="form-group">
                <label>Please select one or more CSSR Sections:</label>
                <div className="section-selection">
                    {Object.keys(categories).map((category) => (
                        <label key={category}>
                            <input 
                                type="checkbox" 
                                name={category} 
                                checked={categories[category]} 
                                onChange={handleCategoryChange} 
                            />
                            {categoryLabels[category] || category} 
                        </label>
                    ))}
                </div>
            </div>
            <button type="submit">Search</button>
        </form>
    );
}

export default SearchForm;
