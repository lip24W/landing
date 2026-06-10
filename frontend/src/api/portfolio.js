import api from './axios';

export const getPortfolio    = ()       => api.get('/portfolio');
export const addPortfolioItem = (data)  => api.post('/portfolio', data);
export const deletePortfolioItem = (id) => api.delete(`/portfolio/${id}`);
