import {
  createContext,
  useContext,
  useState,
} from "react";

import {
  connectSocket,
  disconnectSocket,
} from "../services/socket";

const AuthContext =
  createContext();

export const AuthProvider =
  ({ children }) => {

    const [user, setUser] =
      useState(

        JSON.parse(
          localStorage.getItem(
            "user"
          )
        ) || null
      );

    // login
    const login =
      (data) => {

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",

          JSON.stringify(
            data.user
          )
        );

        setUser(data.user);

        connectSocket();
      };

    // logout
    const logout =
      () => {

        localStorage.clear();

        disconnectSocket();

        setUser(null);
      };

    return (

      <AuthContext.Provider
        value={{
          user,
          login,
          logout,
        }}
      >

        {children}

      </AuthContext.Provider>
    );
  };

export const useAuth =
  () =>
    useContext(
      AuthContext
    );