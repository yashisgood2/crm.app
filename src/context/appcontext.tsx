import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface IUser {
    id: string,
    name: string,
    email: string,
    role: string,
    profilePicture: string
}

interface IAppContext {
    user: IUser | undefined
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppProvider = ({ children }: any) => {
  const [user, setUser] = useState<IUser | undefined>(undefined);

  const getCurrentUser = () => {
    let currentuser: IUser = jwtDecode(localStorage.getItem("accessToken") ?? "");
    if(currentuser) setUser({id: currentuser?.id, name: currentuser?.name,
         email: currentuser?.email, role: currentuser?.role, profilePicture: currentuser?.profilePicture})
  };

  useEffect(() => {
    getCurrentUser()
  }, [])

  return (
    <AppContext.Provider value={{ user }}>
      {children}
    </AppContext.Provider>
  );
};

// Step 4: Consume the context
export const useMyContext = () => useContext(AppContext);