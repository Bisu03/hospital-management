import apiRequest from "./apiRequest";

// Fetch data
export const fetchData = async (endpoint) => {
  const response = await apiRequest.get(`${endpoint}`);
  return response.data;
};


// Create data
export const createData = async (endpoint, newData) => {
  const response = await apiRequest.post(`${endpoint}`, newData);
  return response.data;
};

// Update data
export const updateData = async (endpoint, id, updatedData) => {
  const response = await apiRequest.put(`${endpoint}/${id}`, updatedData);
  return response.data;
};

// Delete data
export const deleteData = async (endpoint, id) => {
  const response = await apiRequest.delete(`${endpoint}/${id}`);
  return response.data;
};
