import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
});

export const tenantName = 'bluboy';

export const getPageSchema = (pageName) => {
  return api.get(`/page-schema/${tenantName}/${pageName}`, {
    params: { status: 'active' }, // Adds a query parameter to filter active schemas
  });
};

export const getAllPageNames = () => {
  return api.get(`/page-schema/${tenantName}`);
};

export const getAllTenants = () => {
  return api.get('/tenants');
};


