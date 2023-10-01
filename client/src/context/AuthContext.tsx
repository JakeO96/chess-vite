import { createContext, useState } from 'react';
import ExpressAPI from '../api/express-api';

type AuthContextType = {
  isLoggedIn: boolean;
  currentClientUsername: string;
  logIn: (fields: { email: string; password: string }) => Promise<boolean | undefined>;
  logOut: () => Promise<boolean | undefined>;
  register: (fields: { email: string; username: string; password: string }) => Promise<boolean | undefined>;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  currentClientUsername: '',
  logIn: async () => true || false,
  logOut: async () => true || false,
  register: async () => true || false,
});

type AuthProviderProps = {
  children: React.ReactNode;
  expressApi: ExpressAPI;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, expressApi }) => {
  const isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isUserLoggedIn);
  const [currentClientUsername, setCurrentClientUsername] = useState<string>('')

  const logIn = async (fields: { email: string; password: string }) => {
    try {
      const res = await expressApi.logUserIn(fields);
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', data.username);
        setCurrentClientUsername(data.username);
        setIsLoggedIn(true);
        return true;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logOut = async () => {
    try {
      const res = await expressApi.logUserOut();
      const data = await res.json();

      if (data.success) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        setCurrentClientUsername('');
        setIsLoggedIn(false);
        return true;
      }
    } catch (err) {
      console.error(err)
      return false;
    }
  };

  const register = async (fields: { email: string; username: string; password: string }) => {
    try {
      const res = await expressApi.createUser(fields);
      const data = await res.json();

      console.log(data);

      if (data.success) {
        return true;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentClientUsername, logIn, logOut, register }}>
      {children}
    </AuthContext.Provider>
  );
};