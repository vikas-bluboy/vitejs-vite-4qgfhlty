import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api/v1/page-data',
});
export const getPageData = (pageName) => {
  return api.get(`/${pageName}/info`);
};
export const getKycData = () => {
    return api.get('/player_new/info');
  };
  
  export const getUserSpins =() => {
    return api.get('/spin_amount_missing/info');
  }