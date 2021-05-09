import { createContext } from 'react';

type ContextType = {
  user: Object;
  setUser: React.Dispatch<React.SetStateAction<Object>>;
};

export const AuthContext = createContext<ContextType | null>(null);
