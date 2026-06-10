import api from './axios';

export const getLeads  = () => api.get('/leads');
export const createLead = (data) => api.post('/leads', data);
