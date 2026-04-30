import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mic, Send, Loader2, MicOff, Brain } from "lucide-react";
import Message from "./Message";
import { api } from "../lib/api";
import message from "../assets/message.png";
import person from "../assets/person.png";

export default function Chat() {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", user?.id],
    queryFn: () => api.getMessages(user!.id!),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Please use Chrome for voice features.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.sendMessage(user!.id!, "user", content);
      let fullAIContent = "";
      setIsStreaming(true);
      await api.getAIStream(user!.id!, content, (chunk) => {
        fullAIContent = chunk;
      });
      setIsStreaming(false);
      return fullAIContent;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", user?.id] });
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMutation.isPending) return;
    sendMutation.mutate(input);
    setInput("");
  };

  return (
    <div className="h-dvh flex flex-col bg-[#080816] text-[#D1C4CE] w-full max-w-6xl mx-auto border-x border-white/5 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-12 -left-12 md:-top-24 md:-left-24 w-64 h-64 md:w-96 md:h-96 bg-[#5654A6]/10 rounded-full blur-[80px] md:blur-[100px]"></div>
        <div className="absolute -bottom-12 -right-12 md:-bottom-24 md:-right-24 w-64 h-64 md:w-96 md:h-96 bg-[#827DBE]/10 rounded-full blur-[80px] md:blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="p-4 md:p-5 border-b border-white/5 backdrop-blur-md bg-[#080816]/60 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-linear-to-tr] rounded-xl flex items-center justify-center shadow-lg">
            <img src={message} alt="" className="w-11 h-11" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
              Gemini Pro
            </h1>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-700 rounded-full animate-pulse"></span>
              <span className="text-[9px] md:text-[10px] text-[#D1C4CE]/60 uppercase font-bold tracking-widest">
                Online Actively
              </span>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="h-10 w-10 md:h-11 md:w-11 rounded-full p-0.5 bg-linear-to-tr from-[#827DBE] to-[#5654A6]">
            <div className="h-full w-full rounded-full bg-[#080816] flex items-center justify-center overflow-hidden">
              <img
                src={person}
                alt="AI Avatar"
                className="w-full h-full object-cover scale-110"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-[#827DBE] mb-2" />
            <p className="text-xs md:text-sm font-medium text-[#D1C4CE]/60">
              Syncing with Core...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 px-4">
            <Brain className="w-12 h-12 md:w-16 md:h-16 mb-4 text-[#5654A6]" />
            <h2 className="text-lg md:text-xl font-semibold text-[#D1C4CE]">
              Workspace Ready
            </h2>
            <p className="text-xs md:text-sm max-w-62.5 md:max-w-xs mt-2 text-[#D1C4CE]/60">
              Send a message to initialize AI memory.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg: any) => (
              <Message key={msg._id} message={msg} />
            ))}

            {isStreaming && (
              <div className="flex items-center gap-2 px-4 py-2 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-[#827DBE]" />
                <span className="text-xs text-[#D1C4CE]/50 font-medium">
                  Ai is thinking...
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer / Input Area */}
      <footer className="p-4 md:p-6 bg-linear-to-t from-[#080816] to-transparent">
        <div className="max-w-4xl mx-auto w-full">
          <div className="relative flex items-center gap-2 md:gap-3 bg-[#3C3B5E]/30 backdrop-blur-xl border border-white/10 p-1.5 md:p-2 rounded-2xl md:rounded-4xl focus-within:border-[#827DBE]/50 transition-all shadow-2xl">
            <button
              onClick={startListening}
              className={`p-2.5 md:p-3 rounded-full transition-all ${isListening ? "bg-[#7974c3] animate-pulse" : "hover:bg-white/5 text-[#D1C4CE]/60"}`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 md:w-5 md:h-5 text-white" />
              ) : (
                <Mic className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Listening..." : "Message Gemini..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base py-2 outline-none text-[#D1C4CE] placeholder:text-[#D1C4CE]/30"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMutation.isPending || isStreaming}
              className="p-2.5 md:p-3 bg-[#7974c3] text-white rounded-full disabled:opacity-20 hover:shadow-[0_0_15px_rgba(201,109,80,0.4)] transition-all active:scale-95 shadow-lg"
            >
              {sendMutation.isPending || isStreaming ? (
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>
          </div>

          <p className="text-center text-[8px] md:text-[10px] text-[#D1C4CE]/30 mt-3 md:mt-4 uppercase tracking-[0.2em] font-bold">
            Powered by Gemini AI • 2.5 Flash End to End Encrypted!
          </p>
        </div>
      </footer>
    </div>
  );
}
