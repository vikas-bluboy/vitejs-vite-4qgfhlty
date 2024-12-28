import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { getPageSchema } from '../services/apiService';
import sampleData from '../data/page1MockData.json';
import 'primereact/resources/themes/saga-blue/theme.css';  // Choose a theme
import 'primereact/resources/primereact.min.css';

const PageSchema = ({ pageName }) => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPageSchema(pageName);
        setSchema(response.data);

        //TODO: Implement a way to fetch data from the API - for respective pageName
        // Filter sample data to include only columns that match the schema
        const filteredData = sampleData.map(row => {
          const filteredRow = {};
          response.data.columns.forEach(col => {
            if (row.hasOwnProperty(col.name)) {
              filteredRow[col.name] = row[col.name];
            }
          });
          return filteredRow;
        });

        setData(filteredData);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [pageName]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const renderColumn = (col) => {
    return (
      <Column
        key={col.name}
        field={col.name}
        header={col.name}
        editor={col.editable ? (options) => <input type={col.type} value={options.value} onChange={(e) => options.editorCallback(e.target.value)} /> : null}
        body={(rowData) => <span>{rowData[col.name]}</span>}
        style={{ textAlign: col.type === 'integer' ? 'right' : 'left' }}
      />
    );
  };

  return (
    <div>
      <h1>Page Schema for {pageName}</h1>
      <DataTable value={data}>
        {schema.columns.map(col => renderColumn(col))}
      </DataTable>
    </div>
  );
};

export default PageSchema;
