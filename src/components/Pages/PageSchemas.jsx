import React, { useState, useEffect } from 'react';
import { getAllPageNames } from '../../services/apiService';
import { Link } from 'react-router';
import { Tree } from 'primereact/tree';

const PageSchemas = ({ tenantName }) => {
    const [schemas, setSchemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchemas = async () => {
            try {
                const response = await getAllPageNames(tenantName);
                console.log('The response data for the tenant is:', response);

                if (response.data && Array.isArray(response.data.pageData)) {
                    // Map all page schemas as top-level tree nodes
                    const treeNodes = response.data.pageData.map((page) => ({
                        label: page.pageTitle, // Schema title as the node label
                        key: page.pageTitle,
                        data: page.pageTitle, // Additional data (optional)
                        url: `/dynamic-table/${page.pageTitle}`, // Dynamic URL for the schema
                    }));
                    setSchemas(treeNodes);
                } else {
                    console.error('pageData not found or is not an array');
                    setSchemas([]);
                }
            } catch (error) {
                setError(error);
                console.error('Error fetching schemas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchemas();
    }, [tenantName]);

    if (loading) return <div>Loading schemas...</div>;
    if (error) return <div>Error loading schemas: {error.message}</div>;

    return (
        <div className="page-schemas-container">
            <h2 className="page-schemas-header">Available Pages Schemas for {tenantName}</h2>
            <div className="card flex justify-content-center">
                {/* PrimeReact Tree component */}
                <Tree
                    value={schemas}
                    style={{ background: 'none', border: 'none' }}
                    nodeTemplate={(node) => (
                        <Link to={node.url} className="schema-link">
                            {node.label} {/* Display schema title */}
                        </Link>
                    )}
                />
            </div>
        </div>
    );
};

export default PageSchemas;
