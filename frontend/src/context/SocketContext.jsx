import {
  createContext,
  useContext,
} from "react";

import useSocketHook from "../hooks/useSocket";

const SocketContext =
  createContext();

export const SocketProvider =
  ({ children }) => {

    const socketData =
      useSocketHook();

    return (

      <SocketContext.Provider
        value={
          socketData.socket
        }
      >

        {children}

      </SocketContext.Provider>
    );
  };

export const useSocket =
  () =>
    useContext(
      SocketContext
    );