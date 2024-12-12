import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryLabels } from '../utils/categoryLabels';

function SearchForm() {
    const [query, setQuery] = useState('');  // Store the search query input
    const [categories, setCategories] = useState({  // Store selected categories for search
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
    const [loading, setLoading] = useState(false);  // To track if the search is in progress
    const [progress, setProgress] = useState(0);    // Track the progress percentage for the loading bar
    const navigate = useNavigate();  // Used to navigate to the results page after search

    // Handle category checkbox changes
    const handleCategoryChange = (e) => {
        const { name, checked } = e.target;

        // If "Select All" is checked/unchecked, update all categories
        if (name === 'selectAll') {
            setCategories(prev => Object.keys(prev).reduce((acc, key) => {
                acc[key] = checked;
                return acc;
            }, {}));
        } else {
            // Update the specific category checkbox
            setCategories(prev => ({
                ...prev,
                [name]: checked,
                selectAll: false,  // Uncheck "Select All" if any category is changed
            }));
        }
    };

    // Handle form submission and trigger search
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);  // Start loading state
        setProgress(0);    // Reset progress bar to 0%

        try {
            // Simulate progress while waiting for the server response
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);  // Stop progress once 90% is reached
                        return 100;
                    }
                    return prev + 6;  // Increment progress by 6%
                });
            }, 1600); // Update every 1600ms

            // Send the search query and categories to the backend API
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, categories }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');  // Handle server errors
            }

            const data = await response.json();
            if (data && data.results) {
                // If results are found, navigate to the results page with the data
                navigate('/results', { state: { query, results: data.results, sources: data.sources } });
            } else {
                console.error('No results found');
            }
        } catch (error) {
            console.error('Error fetching data:', error);  // Handle any fetch errors
        } finally {
            setLoading(false);  // Stop loading state after the search is complete
        }
    };

    return (
        <div>
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

                <button type="submit" disabled={loading}>Search</button> {/* Disable button while loading */}
            </form>

            {/* Loading bar shows up below the form */}
            {loading && (
                <div className="loading-bar-container">
                    <div className="loading-bar" style={{ width: `${progress}%` }}>
                        {progress}%
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchForm;
