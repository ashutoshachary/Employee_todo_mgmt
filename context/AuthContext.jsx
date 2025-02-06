import React, { createContext, useContext, useState } from "react";



export const AuthContext = createContext({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    logout: () => {}
 
});

export const useAuth = () => useContext(AuthContext)


export default function AuthProvider({ children }) {


    const [isAuthenticated, setIsAuthenticated] = useState(false)


    function logout(){
        setIsAuthenticated(false)
    }


    return (
        <AuthContext.Provider value={{  isAuthenticated,setIsAuthenticated, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
