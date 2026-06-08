import axios from 'axios';

export type ExampleData = {
  id: string;
  title: string;
  completed: boolean;
};

export const getExample = async (id: string): Promise<ExampleData> => {
  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/todos/${id}`,
  );
  return response.data;
};

// Example POST request
export const createExample = async (
  data: Omit<ExampleData, 'id'>,
): Promise<ExampleData> => {
  const response = await axios.post(
    'https://jsonplaceholder.typicode.com/todos',
    data,
  );
  return response.data;
};

// Example PUT request
export const updateExample = async (
  id: string,
  data: Partial<Omit<ExampleData, 'id'>>,
): Promise<ExampleData> => {
  const response = await axios.put(
    `https://jsonplaceholder.typicode.com/todos/${id}`,
    data,
  );
  return response.data;
};

// Example DELETE request
export const deleteExample = async (id: string): Promise<void> => {
  await axios.delete(`https://jsonplaceholder.typicode.com/todos/${id}`);
};
