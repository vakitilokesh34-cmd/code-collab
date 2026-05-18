import {
  useEffect,
  useState,
} from "react";

import {
  connectSocket,
  disconnectSocket,
} from "../services/socket";

export default function useSocket() {

  const [socket, setSocket] =
    useState(null);

  const [connected, setConnected] =
    useState(false);

  useEffect(() => {

    // connect
    const s =
      connectSocket();

    setSocket(s);

    // listeners
    s.on(
      "connect",
      () => {

        setConnected(true);
      }
    );

    s.on(
      "disconnect",
      () => {

        setConnected(false);
      }
    );

    // cleanup
    return () => {

      s.off("connect");

      s.off("disconnect");

      disconnectSocket();
    };

  }, []);

  return {
    socket,
    connected,
  };
}