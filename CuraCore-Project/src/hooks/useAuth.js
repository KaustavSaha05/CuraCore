import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// This is a simple function that lets any component easily access the context.
export const useAuth = () => {
  return useContext(AuthContext);
};