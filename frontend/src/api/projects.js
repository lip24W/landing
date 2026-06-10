import api from './axios';

export const getProjects  = ()       => api.get('/projects');
export const getProject   = (id)     => api.get(`/projects/${id}`);
export const createProject = (data)  => api.post('/projects', data);
export const updateProject = (id, data) => api.post(`/projects/${id}`, data);  // POST + _method=PUT для FormData
export const deleteProject = (id)    => api.delete(`/projects/${id}`);
