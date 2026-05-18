import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { connectSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { 
  Users, 
  Play, 
  Share2,
  Copy, 
  LogOut, 
  MessageSquare, 
  History, 
  ChevronRight, 
  Activity, 
  Shield, 
  Check,
  FileCode,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Code2,
  Moon,
  Sun,
  X as XIcon,
  ArrowRight,
  Clock,
  Terminal
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import API from "../services/api";

const CURSOR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
];

const getUserColor = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
};

export default function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [socket, setSocket] = useState(null);
  const [files, setFiles] = useState([{ name: "main.js", content: "// Welcome to CodeCollab\nconsole.log('Hello!');" }]);
  const [activeFile, setActiveFile] = useState("main.js");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [activeSidebar, setActiveSidebar] = useState("files"); // files, users, activity, chat
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [bottomPanelState, setBottomPanelState] = useState("normal"); // closed, normal, expanded
  const [consoleHeight, setConsoleHeight] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [recentRooms, setRecentRooms] = useState([]);
  const [isCopying, setIsCopying] = useState(false);
  const [cursorPositions, setCursorPositions] = useState({});
  const [roomInfo, setRoomInfo] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [bottomTab, setBottomTab] = useState("output");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userCursorPositions, setUserCursorPositions] = useState({}); // { username: { line, column } }

  const editorRef = useRef(null);
  const decorationsRef = useRef([]);
  const editorContainerRef = useRef(null);
  const cursorThrottleRef = useRef(null);
  const remoteCursorsRef = useRef({});
  const monacoRef = useRef(null);
  const cursorActivityThrottleRef = useRef({}); // { userId: timeoutId } — throttle activity log per user
  const socketRef = useRef(null);

  const saveToRecent = useCallback((roomId, name) => {
    const stored = JSON.parse(localStorage.getItem("recentRooms")) || [];
    const filtered = stored.filter(r => r.id !== roomId);
    const updated = [{ id: roomId, name: name || roomId, date: new Date().toLocaleDateString() }, ...filtered].slice(0, 10);
    localStorage.setItem("recentRooms", JSON.stringify(updated));
    setRecentRooms(updated); // Update local state too
  }, []);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data } = await API.get("/rooms/recent");
        setRecentRooms(data);
        if (data.length > 0) localStorage.setItem("recentRooms", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch recent rooms:", error);
        const stored = JSON.parse(localStorage.getItem("recentRooms")) || [];
        setRecentRooms(stored);
      }
    };

    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    fetchRecent();
  }, [user, navigate]);

  useEffect(() => {
    if (!roomId) return;
    
    const s = connectSocket();
    setSocket(s);
    socketRef.current = s;
    
    const userData = JSON.parse(localStorage.getItem("user")) || user;
    const password = location.state?.password || "";

    const join = (pwd = "") => {
      console.log("CLIENT EMITTING room:join for", roomId);
      s.emit("room:join", { roomId, username: userData.username, password: pwd || password });
    };

    if (s.connected) join();
    s.on("connect", join);

    s.on("room:info", (data) => {
      setRoomInfo(data);
      if (data.files && data.files.length > 0) {
        setFiles(data.files);
        setActiveFile(prev => prev || data.files[0].name);
      }
      if (data.roomName) saveToRecent(data.roomId, data.roomName);
    });
    s.on("room:users", (data) => {
      console.log("CLIENT RECEIVED room:users:", data);
      setUsers(data || []);
    });

    s.on("activity:log", (data) => {
      console.log("CLIENT RECEIVED activity:log:", data);
      setActivity((prev) => [data, ...prev].slice(0, 15));
    });

    s.on("chat:message", (data) => setMessages((prev) => [...prev, data]));
    
    s.on("files:sync", (data) => {
      if (data.files) setFiles(data.files);
    });

    s.on("file:sync", ({ fileName, content }) => {
      setFiles(prev => prev.map(f => f.name === fileName ? { ...f, content } : f));
    });

    s.on("code:output", (data) => {
      setOutput(data.output || data.error || "No Output");
      setBottomTab("output");
    });

    s.on("input:sync", ({ input }) => {
      setUserInput(input);
    });

    s.on("error", (data) => {
      if (data.message === "Incorrect password") {
        setPasswordRequired(true);
      } else {
        setOutput(`Error: ${data.message || "Unknown error occurred"}`);
      }
    });

    s.on("cursor:update", (data) => {
      if (data.userId === s.id) return;
      const color = getUserColor(data.username);
      remoteCursorsRef.current[data.userId] = { 
        line: data.line, 
        column: data.column, 
        username: data.username, 
        color,
        lastUpdate: Date.now()
      };
      updateRemoteCursors();

      // Update live cursor position map for the users panel
      setUserCursorPositions(prev => ({
        ...prev,
        [data.username]: { line: data.line, column: data.column }
      }));

      // Throttled activity log — max one entry per user every 3 seconds
      if (!cursorActivityThrottleRef.current[data.userId]) {
        setActivity(prev => [
          `🖊 ${data.username} moved to line ${data.line}`,
          ...prev
        ].slice(0, 20));
        cursorActivityThrottleRef.current[data.userId] = setTimeout(() => {
          delete cursorActivityThrottleRef.current[data.userId];
        }, 3000);
      }
    });

    s.on("cursor:remove", (userId) => {
      delete remoteCursorsRef.current[userId];
      updateRemoteCursors();
    });

    return () => {
      s.off("connect"); s.off("room:info"); s.off("room:users"); s.off("activity:log");
      s.off("chat:message"); s.off("files:sync"); s.off("file:sync"); s.off("code:output"); s.off("cursor:update"); s.off("cursor:remove"); s.off("input:sync");
      Object.keys(remoteCursorsRef.current).forEach(id => {
        s.emit("cursor:leave", { roomId, userId: id });
      });
      remoteCursorsRef.current = {};
    };
  }, [roomId, user]);

  const updateRemoteCursors = useCallback(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    const positions = {};

    Object.entries(remoteCursorsRef.current).forEach(([id, cursor]) => {
      const lineCount = model.getLineCount();
      const validLine = Math.min(Math.max(1, cursor.line), lineCount);
      const maxColumn = model.getLineMaxColumn(validLine);
      const validColumn = Math.min(Math.max(1, cursor.column), maxColumn);

      const position = { lineNumber: validLine, column: validColumn };
      
      const visiblePos = editor.getScrolledVisiblePosition(position);
      if (visiblePos) {
        positions[id] = { 
          top: visiblePos.top, 
          left: visiblePos.left, 
          username: cursor.username, 
          color: cursor.color 
        };
      }
    });

    setCursorPositions(positions);
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    
    // Add scroll and resize listeners to update cursor positions
    const scrollListener = editor.onDidScrollChange(() => updateRemoteCursors());
    const layoutListener = editor.onDidLayoutChange(() => updateRemoteCursors());
    
    const cursorCheckInterval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      Object.keys(remoteCursorsRef.current).forEach(id => {
        if (now - remoteCursorsRef.current[id].lastUpdate > 10000) { // 10 seconds timeout
          delete remoteCursorsRef.current[id];
          changed = true;
        }
      });
      if (changed) updateRemoteCursors();
    }, 5000);
    
    return () => {
      scrollListener.dispose();
      layoutListener.dispose();
      clearInterval(cursorCheckInterval);
    };
  }, [updateRemoteCursors]);

  const handleCodeChange = (value) => {
    setFiles(prev => prev.map(f => f.name === activeFile ? { ...f, content: value } : f));
    socket?.emit("file:update", { roomId, fileName: activeFile, content: value });
  };

  const sendMessage = () => {
    if (!text.trim() || !socket) return;
    socket.emit("chat:send", { roomId, sender: user?.username || "Guest", text });
    setText("");
  };

  const emitCursorMove = (line, column) => {
    if (!socketRef.current) return;
    if (cursorThrottleRef.current) return;
    cursorThrottleRef.current = setTimeout(() => {
      socketRef.current.emit("cursor:move", { roomId, line, column, username: user?.username || "Guest" });
      cursorThrottleRef.current = null;
    }, 50);
  };

  const createFile = () => {
    const name = prompt("File name:");
    if (name) socket?.emit("file:create", { roomId, fileName: name });
  };

  const deleteFile = (name) => {
    if (window.confirm(`Delete ${name}?`)) socket?.emit("file:delete", { roomId, fileName: name });
  };

  const renameFile = (oldName) => {
    const newName = prompt("New file name:", oldName);
    if (newName && newName !== oldName) socket?.emit("file:rename", { roomId, oldName, newName });
  };

  const changeOwner = (newOwnerId) => {
    if (window.confirm("Are you sure you want to transfer ownership to this user? You will lose admin privileges.")) {
      socket?.emit("room:change-owner", { roomId, newOwnerId });
    }
  };

  const runCode = () => {
    const currentContent = files.find(f => f.name === activeFile)?.content || "";
    
    if (!currentContent.trim()) {
      setOutput("Error: Cannot run empty code.");
      setBottomTab("output");
      setBottomPanelState("normal");
      setTimeout(() => editorRef.current?.layout(), 100);
      return;
    }

    setOutput("Running...");
    setBottomTab("output");
    setBottomPanelState("normal");
    
    // Force layout refresh for editor
    setTimeout(() => {
      editorRef.current?.layout();
    }, 100);

    socket?.emit("code:run", { roomId, code: currentContent, language, input: userInput });
  };

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 60 && newHeight < window.innerHeight * 0.85) {
        setConsoleHeight(newHeight);
        setBottomPanelState("custom");
        // Update editor layout immediately during resize
        editorRef.current?.layout();
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleInputSync = (value) => {
    setUserInput(value);
    socket?.emit("input:update", { roomId, input: value });
  };

  const currentFileContent = files.find(f => f.name === activeFile)?.content || "";

  return (
    <div className="h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex overflow-hidden">
      {/* VERTICAL NAV BAR */}
      <div className="w-16 border-r border-[var(--border)] bg-[var(--sidebar)] flex flex-col items-center py-6 gap-8 shrink-0 z-50">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] mb-4">
          <Code2 size={24} />
        </div>
        
        <div className="flex flex-col gap-4">
          {[
            { id: "files", icon: FileCode, label: "Files" },
            { id: "users", icon: Users, label: "Online" },
            { id: "activity", icon: Activity, label: "Activity" },
            { id: "history", icon: Clock, label: "Workspaces" },
            { id: "terminal", icon: Terminal, label: "Console" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "terminal") {
                  if (bottomPanelState === "closed") {
                    // Always reset to initial balanced height (256px) on open
                    setConsoleHeight(256);
                    setBottomPanelState("normal");
                  } else {
                    setBottomPanelState("closed");
                  }
                  // Multi-step refresh: trigger editor layout at multiple points during transition
                  [50, 150, 310].forEach(delay => {
                    setTimeout(() => {
                      editorRef.current?.layout();
                      updateRemoteCursors();
                    }, delay);
                  });
                  return;
                }
                if (activeSidebar === item.id) {
                  setIsSidebarOpen(!isSidebarOpen);
                } else {
                  setActiveSidebar(item.id);
                  setIsSidebarOpen(true);
                }
              }}
              className={`p-3 rounded-xl transition-all group relative ${item.id === "terminal" ? (bottomPanelState !== "closed" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-500") : (activeSidebar === item.id && isSidebarOpen ? "bg-emerald-500/10 text-emerald-400" : "text-slate-500 hover:text-slate-300")}`}
              title={item.label}
            >
              <item.icon size={20} />
              {activeSidebar === item.id && isSidebarOpen && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-l-full" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <button
            onClick={() => setIsChatOpen(o => !o)}
            className={`p-3 rounded-xl transition-all relative ${isChatOpen ? "bg-emerald-500/10 text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
            title="Chat"
          >
            <MessageSquare size={20} />
            {isChatOpen && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-l-full" />}
          </button>
          <button onClick={toggleTheme} className="p-3 text-slate-500 hover:text-emerald-400 transition-colors">
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => navigate("/")} className="p-3 text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* DYNAMIC SIDEBAR */}
      {isSidebarOpen && (
        <div className="w-72 md:w-64 border-r border-[var(--border)] bg-[var(--sidebar)] flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-secondary)]">
              {activeSidebar}
            </h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 hover:text-white">
              <ChevronRight size={16} className="rotate-180" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeSidebar === "files" && (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Workspace Files</span>
                  <button onClick={createFile} className="hover:text-emerald-400 transition-colors"><Plus size={14} /></button>
                </div>
                <div className="space-y-1">
                  {files.map(file => (
                    <div 
                      key={file.name} 
                      onClick={() => setActiveFile(file.name)}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${activeFile === file.name ? "bg-emerald-500/10 text-emerald-400" : "hover:bg-slate-900/50 text-slate-400"}`}
                    >
                      <FileCode size={14} />
                      <span className="text-xs flex-1 truncate">{file.name}</span>
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button onClick={(e) => {e.stopPropagation(); renameFile(file.name)}} className="p-0.5 hover:text-white"><Edit2 size={10} /></button>
                        <button onClick={(e) => {e.stopPropagation(); deleteFile(file.name)}} className="p-0.5 hover:text-red-400"><Trash2 size={10} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSidebar === "users" && (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Online ({users.length})</span>
                </div>
                <div className="space-y-3">
                  {users.map((u, i) => {
                    const color = getUserColor(u.username);
                    const cursorPos = userCursorPositions[u.username];
                    const isMe = u.userId?.toString() === (user?.id || user?._id)?.toString();
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:border-slate-700 transition-all">
                        {/* Avatar with initial */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-black shadow-lg shrink-0 relative"
                          style={{ backgroundColor: color }}
                        >
                          {u.username[0].toUpperCase()}
                          {/* Live pulse indicator */}
                          {cursorPos && (
                            <div
                              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--sidebar)] animate-pulse"
                              style={{ backgroundColor: color }}
                            />
                          )}
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate">
                              {u.username} {isMe && <span className="text-[9px] text-slate-500">(you)</span>}
                            </span>
                            {u.userId?.toString() === roomInfo?.owner?.toString() && (
                              <span className="text-[9px]">👑</span>
                            )}
                          </div>
                          {cursorPos ? (
                            <span
                              className="text-[9px] font-bold uppercase tracking-tighter"
                              style={{ color }}
                            >
                              Line {cursorPos.line} · Col {cursorPos.column}
                            </span>
                          ) : (
                            <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">
                              {isMe ? "Editing" : "Connected"}
                            </span>
                          )}
                        </div>

                        {roomInfo?.owner?.toString() === (user?.id || user?._id)?.toString() && u.userId?.toString() !== roomInfo?.owner?.toString() && (
                          <button
                            onClick={() => changeOwner(u.userId)}
                            className="p-1.5 bg-slate-800 hover:bg-emerald-500 hover:text-black rounded-lg text-slate-500 transition-all shrink-0"
                            title="Make Admin"
                          >
                            <Shield size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSidebar === "activity" && (
              <div className="p-5">
                <div className="flex items-center justify-between mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Activity Logs</span>
                </div>
                <div className="space-y-2">
                  {activity.map((log, i) => {
                    const isCursor = log.startsWith("🖊");
                    return (
                      <div key={i} className="flex gap-3 text-[11px] items-start">
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                          isCursor ? "bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        }`} />
                        <span className={`leading-relaxed ${isCursor ? "text-blue-300/70 text-[10px]" : "text-slate-400 italic"}`}>{log}</span>
                      </div>
                    );
                  })}
                  {activity.length === 0 && (
                    <div className="text-center py-8 opacity-30">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No activity yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}


            {activeSidebar === "history" && (
              <div className="p-5">
                <div className="flex items-center justify-between mb-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Recent Workspaces</span>
                </div>
                <div className="space-y-4">
                  {recentRooms.map((room) => (
                    <div 
                      key={room.id}
                      onClick={() => navigate(`/room/${room.id}`)}
                      className={`group p-4 rounded-2xl border transition-all cursor-pointer ${room.id === roomId ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-900/30 border-slate-800/50 hover:border-emerald-500/30"}`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">ID: {room.id}</span>
                          <span className="text-[8px] text-slate-500">{room.date}</span>
                        </div>
                        <h3 className={`text-xs font-bold truncate ${room.id === roomId ? "text-emerald-400" : "text-slate-300 group-hover:text-white"}`}>{room.name}</h3>
                      </div>
                    </div>
                  ))}
                  {recentRooms.length === 0 && (
                    <div className="text-center py-10">
                      <Clock size={24} className="mx-auto text-slate-700 mb-2 opacity-20" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">No history yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 border-r border-[var(--border)]">
        <div className="h-14 border-b border-[var(--border)] bg-[var(--header)] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-md">
              {files.map(file => (
                <div 
                  key={file.name}
                  onClick={() => setActiveFile(file.name)}
                  className={`px-3 py-1 text-xs rounded-t-lg border-x border-t border-transparent cursor-pointer flex items-center gap-2 shrink-0 transition-all ${activeFile === file.name ? "bg-slate-900 border-slate-800 text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <FileText size={12} /> {file.name}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md outline-none">
              {["javascript", "python", "java", "cpp", "c", "go", "rust", "ruby", "php", "typescript", "swift", "kotlin", "csharp"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button 
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url); 
                setIsCopying(true); 
                setTimeout(() => setIsCopying(false), 2000)
              }} 
              className="p-2 bg-slate-900 border border-slate-800 rounded-md hover:bg-slate-800"
            >
              {isCopying ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
            </button>
            <button onClick={runCode} className="flex items-center gap-2 bg-emerald-500 text-black px-4 py-1 rounded-md text-xs font-bold hover:bg-emerald-400">
              <Play size={14} fill="currentColor" /> RUN
            </button>
          </div>
        </div>

        <div ref={editorContainerRef} className="flex-1 relative bg-[var(--editor-bg)] overflow-hidden">
          <Editor
            theme={theme === "dark" ? "vs-dark" : "light"}
            language={language}
            value={currentFileContent}
            onChange={handleCodeChange}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              monacoRef.current = monaco;
              editor.onDidChangeCursorPosition(e => {
                emitCursorMove(e.position.lineNumber, e.position.column);
              });
            }}
            options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, padding: { top: 20 }, cursorSmoothCaretAnimation: "on" }}
          />
          {isResizing && (
            <div className="absolute inset-0 z-[100] cursor-ns-resize bg-transparent" />
          )}
          {/* REMOTE CURSORS OVERLAY */}
          <div className="absolute inset-0 pointer-events-none z-[9999] overflow-hidden">
            {Object.entries(cursorPositions).map(([id, pos]) => (
              <div
                key={id}
                className="absolute transition-all duration-100 ease-out"
                style={{
                  top: pos.top,
                  left: pos.left,
                }}
              >
                {/* CURSOR LINE */}
                <div 
                  className="w-[2px] h-5 absolute top-0 left-0"
                  style={{ 
                    backgroundColor: pos.color, 
                    zIndex: 10000 
                  }}
                />
                {/* USER TAG */}
                <div
                  className="absolute bottom-full left-0 animate-in zoom-in-50 duration-200"
                  style={{ zIndex: 10001 }}
                >
                  <div 
                    className="px-2 py-[1px] rounded-t-md rounded-br-md text-[11px] font-medium whitespace-nowrap text-white shadow-sm"
                    style={{ backgroundColor: pos.color }}
                  >
                    {pos.username}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {bottomPanelState !== "closed" && (
          <div 
            className={`border-t border-[var(--border)] bg-[var(--bg)] flex flex-col relative transition-all duration-300 ${isResizing ? "transition-none shadow-[0_-10px_30px_rgba(16,185,129,0.1)]" : "animate-in slide-in-from-bottom"} ${bottomPanelState === "expanded" ? "flex-1" : "shrink-0"}`}
            style={{ height: (bottomPanelState === "custom" || bottomPanelState === "normal") ? `${consoleHeight}px` : "auto" }}
          >
            {/* DRAG HANDLE BAR */}
            <div 
              onMouseDown={startResizing}
              className="absolute -top-1.5 left-0 w-full h-3 cursor-ns-resize z-[110] group"
            >
              <div className={`w-16 h-1 bg-emerald-500/30 rounded-full mx-auto mt-1 transition-all group-hover:bg-emerald-500/80 ${isResizing ? "bg-emerald-500 w-32 h-1.5" : ""}`} />
            </div>

            <div className="flex items-center justify-between bg-[var(--header)] border-b border-[var(--border)] px-2">
              <div className="flex">
                <button 
                  onClick={() => setBottomTab("output")}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${bottomTab === "output" ? "text-emerald-400 border-emerald-400" : "text-slate-500 border-transparent hover:text-slate-300"}`}
                >
                  Output
                </button>
                <button 
                  onClick={() => setBottomTab("input")}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${bottomTab === "input" ? "text-emerald-400 border-emerald-400" : "text-slate-500 border-transparent hover:text-slate-300"}`}
                >
                  Input (STDIN)
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    if (bottomPanelState === "expanded") {
                      setBottomPanelState("normal");
                      setConsoleHeight(256);
                    } else {
                      setBottomPanelState("expanded");
                    }
                    [50, 150, 310].forEach(delay => {
                      setTimeout(() => {
                        editorRef.current?.layout();
                        updateRemoteCursors();
                      }, delay);
                    });
                  }}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                  title={bottomPanelState === "expanded" ? "Shrink" : "Maximize"}
                >
                  {bottomPanelState === "expanded" ? <ChevronRight size={14} className="rotate-90" /> : <ChevronRight size={14} className="-rotate-90" />}
                </button>
                <button 
                  onClick={() => setBottomPanelState("closed")}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Close Panel"
                >
                  <XIcon size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {bottomTab === "output" ? (
                <pre className="p-4 font-mono text-xs text-slate-300 h-full overflow-y-auto whitespace-pre-wrap">
                  {output || "Waiting for execution..."}
                </pre>
              ) : (
                <textarea
                  value={userInput}
                  onChange={(e) => handleInputSync(e.target.value)}
                  placeholder="Enter standard input here..."
                  className="w-full h-full bg-transparent p-4 font-mono text-xs text-emerald-400 outline-none resize-none"
                />
              )}
            </div>
          </div>
        )}

        {bottomPanelState === "closed" && (
          <div className="h-8 bg-[var(--header)] border-t border-[var(--border)] flex items-center px-4">
            <button 
              onClick={() => setBottomPanelState("normal")}
              className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 flex items-center gap-2"
            >
              <ChevronRight size={12} className="-rotate-90" /> Show Console
            </button>
          </div>
        )}
      </div>

      {/* RIGHT CHAT PANEL */}
      {isChatOpen && (
        <div className="w-80 border-l border-[var(--border)] bg-[var(--sidebar)] flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
          <div className="h-14 border-b border-[var(--border)] flex items-center justify-between px-5 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <MessageSquare size={14} className="text-emerald-400" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Live Chat</h2>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <XIcon size={16} />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                <MessageSquare size={28} className="text-slate-600" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">No messages yet</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col gap-0.5 ${m.sender === user?.username ? "items-end" : "items-start"}`}>
                {(i === 0 || messages[i-1]?.sender !== m.sender) && (
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-1 mb-0.5"
                    style={{ color: getUserColor(m.sender) }}
                  >
                    {m.sender === user?.username ? "You" : m.sender}
                  </span>
                )}
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === user?.username
                    ? "bg-emerald-500 text-black font-semibold rounded-br-sm"
                    : "bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[var(--border)] shrink-0">
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-2.5 focus-within:border-emerald-500/50 transition-all">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Send a message..."
                className="flex-1 bg-transparent outline-none text-xs text-white placeholder-slate-600"
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim()}
                className="w-7 h-7 rounded-xl bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 flex items-center justify-center text-black transition-all hover:bg-emerald-400 shrink-0"
              >
                <ArrowRight size={13} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {passwordRequired && (
        <div className="fixed inset-0 bg-[#020817]/95 backdrop-blur-sm flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#0b1120] border border-slate-800 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 mx-auto">
              <Shield size={24} />
            </div>
            <h2 className="text-3xl font-black mb-2 text-white text-center">Room Protected</h2>
            <p className="text-slate-400 text-sm mb-8 text-center">This workspace requires a password to join.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Enter Password</label>
                <input
                  type="password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (setPasswordRequired(false), socket.emit("room:join", { roomId, username: user?.username, password: roomPassword }))}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-slate-800 px-6 py-4 rounded-2xl outline-none focus:border-emerald-500/50 transition-all text-center text-xl tracking-widest text-white"
                  autoFocus
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold text-sm transition-all"
                >
                  Go Back
                </button>
                <button
                  onClick={() => {
                    setPasswordRequired(false);
                    socket.emit("room:join", { roomId, username: user?.username, password: roomPassword });
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-2xl font-bold text-sm transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}