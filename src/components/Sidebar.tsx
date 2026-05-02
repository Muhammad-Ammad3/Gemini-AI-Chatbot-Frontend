import { useState, useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import {
  Search,
  Plus,
  ChevronRight,
  LogOut,
  MessageSquare,
  Menu,
  X,
  Trash,
} from "lucide-react";
import { api } from "../lib/api";
import Message from "../assets/message.png"

interface Session {
  _id: string;
  lastMessage: string;
  createdAt: string;
}

interface SidebarProps {
  userId: string;
  chatId: string;
  userName: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export default function Sidebar({
  userId,
  chatId,
  userName,
  onNewChat,
  onSelectChat,
}: SidebarProps) {
  const { signOut } = useClerk();
  const [showLogout, setShowLogout] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await api.getSessions(userId);
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    if (userId) {
      fetchSessions();
    }
  }, [userId, chatId]);

  const handleDeleteSession = async (
    e: React.MouseEvent,
    sessionId: string,
  ) => {
    e.stopPropagation();

    try {
      await api.deleteSession(sessionId);

      setSessions((prev) =>
        prev.filter((session) => session._id !== sessionId),
      );

      if (chatId === sessionId) {
        onNewChat();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Chat delete karne mein masla pesh aya, dobara koshish karein.");
    }
  };

  const filteredSessions = sessions.filter((session) =>
    session.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-20 left-4 z-70 p-2 bg-white dark:bg-[#080816] border border-zinc-200 dark:border-white/5 rounded-lg shadow-md flex items-center justify-center text-zinc-600 dark:text-[#D1C4CE]"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed md:relative top-0 left-0 bottom-0 w-72 h-full bg-white dark:bg-[#080816] border-r border-zinc-200 dark:border-white/5 flex flex-col p-4 text-zinc-600 dark:text-[#D1C4CE] transition-all duration-300 z-65 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } pt-16 md:pt-4`}
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-linear-to-tr rounded-xl flex items-center justify-center shadow-lg">
           <img src={Message} alt="Message" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-zinc-900 dark:text-zinc-100">
              Gemini AI
            </h1>
            <p className="text-[10px] text-zinc-400 dark:text-[#D1C4CE]/60 font-medium uppercase tracking-wider">
              Intelligent AI Assistant
            </p>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            onNewChat();
            setIsOpen(false);
          }}
          className="w-full py-3 bg-[#7974c3] hover:bg-[#6964b3] text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#7974c3]/20 mb-6 cursor-pointer"
        >
          <Plus size={18} />
          New Chat
        </button>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-[#D1C4CE]/40"
            size={16}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full bg-zinc-50 dark:bg-[#3C3B5E]/20 border border-zinc-200 dark:border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#827DBE]/30 text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#D1C4CE]/30"
          />
        </div>

        {/* Recent Chats Section */}
        <div className="flex-1 overflow-y-auto max-h-75 md:max-h-100">
          <h3 className="text-xs font-bold text-zinc-400 dark:text-[#D1C4CE]/40 uppercase tracking-widest mb-4 px-2">
            Recent Chats
          </h3>
          <div className="space-y-2">
            {filteredSessions.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-[#D1C4CE]/40 px-2">
                No recent conversations yet.
              </p>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session._id}
                  onClick={() => {
                    onSelectChat(session._id);
                    setIsOpen(false);
                  }}
                  className={`p-3 bg-zinc-50 dark:bg-[#3C3B5E]/20 border border-zinc-200 dark:border-white/5 rounded-xl shadow-md cursor-pointer border-l-4 border-l-[#827DBE] hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors group relative ${
                    chatId === session._id
                      ? "bg-zinc-100 border-zinc-300 dark:bg-white/10 dark:border-white/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-[#827DBE]" />
                      <p className="text-sm font-semibold truncate text-zinc-800 dark:text-zinc-100 w-36">
                        {session.lastMessage}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteSession(e, session._id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                      title="Delete chat"
                    >
                      <Trash size={14} />
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-400 dark:text-[#D1C4CE]/40 mt-1">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-white/5 space-y-2">
          {/* User Card With Dropdown */}
          <div className="relative mt-4">
            <button
              onClick={() => setShowLogout(!showLogout)}
              className="w-full flex items-center justify-between p-3 bg-zinc-50 dark:bg-[#3C3B5E]/20 border border-zinc-200 dark:border-white/5 rounded-xl shadow-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#827DBE]/20 text-zinc-800 dark:text-white rounded-lg flex items-center justify-center font-bold">
                  {userName ? userName[0] : "U"}
                </div>
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  {userName || "User"}
                </span>
              </div>
              <ChevronRight
                size={16}
                className={`text-zinc-400 dark:text-[#D1C4CE]/30 transition-transform ${
                  showLogout ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* Logout Dropdown */}
            {showLogout && (
              <div className="absolute bottom-full mb-2 left-0 w-full bg-white dark:bg-[#080816] border border-zinc-200 dark:border-white/10 rounded-xl p-2 shadow-2xl z-50 flex flex-col gap-1">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 p-2.5 hover:bg-red-500/10 rounded-lg text-sm text-red-400 font-semibold transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
