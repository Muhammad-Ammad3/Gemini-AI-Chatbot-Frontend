import { useState, useEffect, useRef } from "react";
import { api } from "../lib/api";
import { 
  Send,  
  Loader2, 
  Mic, 
  Volume2, 
  Copy, 
  Check, 
  HelpCircle, 
  Edit3, 
  Settings 
} from "lucide-react";
import person from "../assets/person.png";

interface Message {
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface ChatProps {
  chatId: string;
  userId: string;
}

export default function Chat({ chatId, userId }: ChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const allMessages = await api.getMessages(userId);
        const currentChatMessages = allMessages.filter(
          (msg: any) => msg.chatId === chatId,
        );
        setMessages(currentChatMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      }
    };

    if (userId) {
      fetchMessages();
    }
  }, [chatId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Aapka browser voice input/speech recognition support nahi karta.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInput(text);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Aapka browser voice output support nahi karta.");
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index); 

      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } else {
      console.error("Clipboard API not supported");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      chatId,
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let assistantContent = "";
      setMessages((prev) => [
        ...prev,
        { chatId, role: "assistant", content: "..." },
      ]);

      await api.getAIStream(userId, userMessage.content, chatId, (text) => {
        assistantContent = text;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            chatId,
            role: "assistant",
            content: assistantContent,
          };
          return updated;
        });
      });

      await api.sendMessage(userId, "user", userMessage.content);
    } catch (error) {
      console.error("Stream failed:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          chatId,
          role: "assistant",
          content: "Oops! Error generating response. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#0F0E26] dark:bg-[#0F0E26] flex flex-col justify-between p-3 md:p-6 transition-colors duration-300 text-zinc-800 dark:text-[#D1C4CE]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-4 md:px-4 min-h-[60vh] md:h-full">
            {/* Glowing Icon Section */}
            <div className="relative mb-3 md:mb-6 shrink-0">
              <div className="absolute inset-0 bg-[#7974c3]/30 blur-2xl rounded-full"></div>
              <div className="w-14 h-14 md:w-20 md:h-20 bg-linear-to-tr  rounded-2xl flex items-center justify-center text-white shadow-2xl relative">
                <img src={person} alt="Person" className="text-white animate-pulse" />
              </div>
            </div>

            {/* Title and Subtitle */}
            <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-white mb-2 tracking-tight">
              AI Gemini Chatbot
            </h2>
            <p className="text-[#7974c3] mb-6 md:mb-12 max-w-lg font-medium text-xs md:text-base px-2">
              Complete your half-formed queries.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 max-w-4xl w-full px-2">
              {/* Card 1 */}
              <div className="bg-[#1C1B3A]/80 border border-white/10 rounded-2xl p-3 md:p-6 flex flex-col items-center text-center hover:border-[#7974c3]/50 transition-all duration-300 group hover:shadow-[0_8px_30px_rgba(121,116,195,0.1)] backdrop-blur-sm">
                <div className="p-2.5 bg-[#7974c3]/20 rounded-xl text-[#7974c3] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <HelpCircle size={22} />
                </div>
                <h3 className="text-white font-semibold text-xs md:text-base mb-1 md:mb-2">Ask Gemini Anything</h3>
                <p className="text-[10px] md:text-xs text-[#D1C4CE]/60 leading-relaxed">
                  From complex queries to simple explanations.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-[#1C1B3A]/80 border border-white/10 rounded-2xl p-3 md:p-6 flex flex-col items-center text-center hover:border-[#7974c3]/50 transition-all duration-300 group hover:shadow-[0_8px_30px_rgba(121,116,195,0.1)] backdrop-blur-sm">
                <div className="p-2.5 bg-[#7974c3]/20 rounded-xl text-[#7974c3] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Edit3 size={22} />
                </div>
                <h3 className="text-white font-semibold text-xs md:text-base mb-1 md:mb-2">Creative Writing Partner</h3>
                <p className="text-[10px] md:text-xs text-[#D1C4CE]/60 leading-relaxed">
                  Creative writing or chat explanations.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-[#1C1B3A]/80 border border-white/10 rounded-2xl p-3 md:p-6 flex flex-col items-center text-center hover:border-[#7974c3]/50 transition-all duration-300 group hover:shadow-[0_8px_30px_rgba(121,116,195,0.1)] backdrop-blur-sm sm:col-span-2 md:col-span-1">
                <div className="p-2.5 bg-[#7974c3]/20 rounded-xl text-[#7974c3] mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Settings size={22} />
                </div>
                <h3 className="text-white font-semibold text-xs md:text-base mb-1 md:mb-2">Quick Solutions</h3>
                <p className="text-[10px] md:text-xs text-[#D1C4CE]/60 leading-relaxed">
                  Easir to quick solutions and various solutions.
                </p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 md:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] p-3 md:p-5 rounded-2xl backdrop-blur-sm transition-all ${
                  msg.role === "user"
                    ? "bg-linear-to-r from-[#7974c3] to-[#5952a3] text-white shadow-[0_4px_20px_rgba(121,116,195,0.3)]"
                    : "bg-[#1C1B3A] border border-white/5 text-[#D1C4CE] shadow-[0_4px_25px_rgba(0,0,0,0.2)]"
                }`}
              >
                <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                <div className="flex items-center gap-2 mt-2 md:mt-3 text-xs">
                  {/* Copy Button */}
                  <button
                    onClick={() => copyToClipboard(msg.content, index)}
                    className="p-1.5 rounded-lg hover:bg-zinc-100/10 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    {copiedIndex === index ? (
                      <Check size={13} className="text-green-400" />
                    ) : (
                      <Copy size={13} className="text-zinc-400" />
                    )}
                  </button>
                  
                  {/* Voice Output Button for Assistant */}
                  {msg.role === "assistant" && msg.content !== "..." && (
                    <button
                      onClick={() => speakText(msg.content)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-zinc-300/10 dark:border-white/10 bg-zinc-200/5 dark:bg-white/5 hover:bg-zinc-300/10 dark:hover:bg-white/10 transition-all text-zinc-300 cursor-pointer"
                      title="Sunain"
                    >
                      <Volume2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="bg-[#1C1B3A] border border-[#7974c3]/30 rounded-2xl md:rounded-3xl p-2 md:p-3 flex items-center gap-2 md:gap-3 shadow-[0_0_20px_rgba(121,116,195,0.15)] focus-within:border-[#7974c3]/60 transition-all duration-300"
      >
        {/* Voice Input Button */}
        <button
          type="button"
          onClick={startListening}
          className={`p-2 rounded-xl md:rounded-2xl transition-all cursor-pointer ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-[#7974c3]/20 text-[#7974c3] hover:bg-[#7974c3]/30 hover:text-white"
          }`}
          title="Voice Input"
        >
          <Mic size={15} />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gemini AI anything..."
          className="flex-1 bg-transparent border-none py-1.5 md:py-2 px-2 md:px-3 text-xs md:text-sm focus:outline-none text-white placeholder:text-[#D1C4CE]/30"
          disabled={isLoading}
        />

        <button
          type="submit"
          className="p-2 bg-[#7974c3] hover:bg-[#6964b3] text-white rounded-xl md:rounded-2xl transition-all cursor-pointer shadow-md disabled:opacity-40"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
        </button>
      </form>
    </div>
  );
}