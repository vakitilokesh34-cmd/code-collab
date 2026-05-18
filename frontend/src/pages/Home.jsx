import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, 
  LogIn, 
  LogOut, 
  Code2, 
  Users, 
  Zap, 
  Shield, 
  Globe,
  ChevronRight,
  Layout,
  Clock,
  ArrowRight,
  X as XIcon,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [socket, setSocket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [password, setPassword] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [recentRooms, setRecentRooms] = useState([]);

  useEffect(() => {
    const currentUser = user || JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      navigate("/login");
    } else {
      const fetchRecent = async () => {
        try {
          const token = localStorage.getItem("token");
          console.log("DEBUG: Fetching history with token exists:", !!token);
          const res = await fetch("http://localhost:5000/api/rooms/recent", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            console.log("DEBUG: History data received:", data.length);
            setRecentRooms(data);
          } else {
            console.error("DEBUG: API Error", res.status);
            const stored = JSON.parse(localStorage.getItem("recentRooms")) || [];
            setRecentRooms(stored);
          }
        } catch (error) {
          console.error("DEBUG: Fetch Failed", error);
          const stored = JSON.parse(localStorage.getItem("recentRooms")) || [];
          setRecentRooms(stored);
        }
      };
      fetchRecent();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const s = connectSocket();
    setSocket(s);
  }, [user]);

  const saveToRecent = (roomId, name) => {
    const stored = JSON.parse(localStorage.getItem("recentRooms")) || [];
    const filtered = stored.filter(r => r.id !== roomId);
    const updated = [{ id: roomId, name: name || roomId, date: new Date().toLocaleDateString() }, ...filtered].slice(0, 10);
    localStorage.setItem("recentRooms", JSON.stringify(updated));
    setRecentRooms(updated);
  };

  const createRoom = () => {
    if (!roomName) {
      alert("Please enter a room name");
      return;
    }

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const userData = JSON.parse(localStorage.getItem("user")) || { username: "Guest" };

    socket.on("room:created", ({ roomId: id }) => {
      saveToRecent(id, roomName);
      navigate(`/room/${id}`, { state: { password } });
    });

    socket.emit("room:create", {
      roomId,
      username: userData.username,
      roomName,
      language,
      password,
    });
  };

  const joinRoom = (id, pwd = "") => {
    const rid = id || joinRoomId;
    if (!rid) return;
    saveToRecent(rid, rid);
    navigate(`/room/${rid}`, { state: { password: pwd || joinPassword } });
  };

  const clearHistory = async () => {
    if (!window.confirm("Are you sure you want to close and clear all recent rooms? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/rooms/clear-history", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setRecentRooms([]);
        localStorage.removeItem("recentRooms");
      }
    } catch (error) {
      console.error("Failed to clear history", error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-emerald-500/30">
      {/* NAVBAR */}
      <nav className="h-20 border-b border-[var(--border)] flex items-center justify-between px-8 bg-[var(--header)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Code2 size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[var(--text)] to-[var(--text-secondary)] bg-clip-text text-transparent">
            CodeCollab
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-all text-slate-400 hover:text-emerald-400"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-black">
              {(user?.username || "U")[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-300">Hey, {user?.username || "Friend"}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6 uppercase tracking-widest">
              <Zap size={14} fill="currentColor" />
              Real-time collaboration
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-tight mb-6 md:mb-8">
              Code together, <br />
              <span className="text-emerald-500">anywhere.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-lg mb-8 md:mb-12 leading-relaxed">
              The ultimate platform for real-time pair programming, interviews, and team collaboration. High performance, low latency.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center gap-2"
              >
                <Plus size={24} strokeWidth={3} />
                Create New Room
              </button>
              <div className="flex bg-[var(--card)] border border-[var(--border)] p-1.5 rounded-2xl focus-within:border-emerald-500/50 transition-all shadow-2xl">
                <input
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Enter Room ID"
                  className="bg-transparent px-6 py-3 outline-none text-xl w-64 text-[var(--text)]"
                />
                <button
                  onClick={() => joinRoom()}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  Join
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* QUICK ACCESS RECENT ROOMS */}
            {user && recentRooms.length > 0 && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <Clock size={12} className="text-emerald-500" />
                  Quick Access
                </div>
                <div className="flex flex-wrap gap-3">
                  {recentRooms.slice(0, 3).map((room) => (
                    <button
                      key={room.id}
                      onClick={() => joinRoom(room.id)}
                      className="group flex items-center gap-3 bg-slate-900/40 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 px-4 py-2 rounded-xl transition-all"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${room.status === "Active" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-600"}`} />
                      <span className="text-xs font-bold text-slate-400 group-hover:text-white truncate max-w-[120px]">{room.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute -inset-10 bg-emerald-500/20 blur-[100px] rounded-full opacity-30"></div>
            <div className="relative bg-[#0b1120] border border-slate-800 rounded-[40px] p-2 shadow-2xl overflow-hidden group">
              <div className="h-10 bg-[#020817] flex items-center gap-1.5 px-6 border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              </div>
              <div className="p-10 font-mono text-base space-y-6">
                <div className="flex gap-4">
                  <span className="text-slate-600">1</span>
                  <span className="text-emerald-400">function</span>
                  <span className="text-purple-400">CodeCollab</span>() {'{'}
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-600">2</span>
                  <span className="pl-4 text-slate-300">console.log(<span className="text-amber-300">"Happy coding!"</span>);</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-600">3</span>
                  <span className="text-slate-300">{'}'}</span>
                </div>
                <div className="mt-12 pt-10 border-t border-slate-800/50 flex gap-10">
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-emerald-500" />
                    <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Active Syncing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap size={20} className="text-emerald-500" />
                    <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Low Latency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EXTENDED RECENT ROOMS SECTION */}
        {user && recentRooms.length > 3 && (
          <div className="mt-20 md:mt-32">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div className="flex items-center gap-4">
                <div className="p-2 md:p-3 bg-emerald-500/10 rounded-xl text-emerald-500 shadow-inner">
                  <Clock size={20} className="md:w-6 md:h-6" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">Recent Workspaces</h2>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={clearHistory}
                  className="px-6 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                >
                  <XIcon size={14} />
                  Close All
                </button>
                <span className="text-slate-500 text-sm font-medium">Showing last {recentRooms.length} rooms</span>
              </div>
            </div>
            
            <div className="relative group">
              <div className="overflow-x-auto pb-8 pt-4 -mx-4 px-4 flex gap-8 snap-x custom-scrollbar-horizontal">
                {recentRooms.map((room) => (
                  <div 
                    key={room.id}
                    onClick={() => joinRoom(room.id)}
                    className="min-w-[400px] p-10 rounded-[40px] bg-[var(--card)] border border-[var(--border)] hover:border-emerald-500/40 transition-all group cursor-pointer relative overflow-hidden snap-start hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ArrowRight size={24} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest w-fit border border-emerald-500/20">
                          ID: {room.id}
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${room.status === "Active" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse" : "bg-slate-800/50 text-slate-500 border-slate-700"}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${room.status === "Active" ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-600"}`} />
                          {room.status}
                        </div>
                      </div>
                      <h3 className="text-3xl font-black group-hover:text-emerald-400 transition-colors truncate pr-12">{room.name}</h3>
                      <div className="flex items-center gap-3 text-slate-500 text-sm mt-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center">
                          <Clock size={16} />
                        </div>
                        Joined on {room.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {user && recentRooms.length === 0 && (
          <div className="mt-20 md:mt-32 text-center py-20 bg-slate-900/20 rounded-[40px] border border-dashed border-slate-800 max-w-7xl mx-auto px-8">
            <Clock size={40} className="mx-auto text-slate-700 mb-4 opacity-20" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No recent workspaces found</p>
            <p className="text-slate-600 text-xs mt-2">Create or join a room to see it here.</p>
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-[#020817]/95 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-[#0b1120] border border-slate-800 rounded-[40px] p-10 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <XIcon size={24} />
            </button>

            <h2 className="text-5xl font-black mb-4 text-white">New Room</h2>
            <p className="text-slate-400 text-lg mb-10">Configure your workspace and start collaborating.</p>

            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Room Name</label>
                <input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. System Design Interview"
                  className="w-full bg-slate-900/50 border border-slate-800 px-6 py-5 rounded-2xl outline-none focus:border-emerald-500/50 transition-all text-xl text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 px-6 py-5 rounded-2xl outline-none focus:border-emerald-500/50 transition-all text-xl appearance-none cursor-pointer capitalize text-white"
                  >
                    {['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'php', 'ruby', 'typescript', 'swift', 'kotlin', 'csharp'].map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Password (optional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/50 border border-slate-800 px-6 py-5 rounded-2xl outline-none focus:border-emerald-500/50 transition-all text-xl text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-5 rounded-2xl font-bold text-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={createRoom}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-5 rounded-2xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                  Create Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}} />
    </div>
  );
}