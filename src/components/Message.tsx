import { Copy, Volume2, Check, User } from "lucide-react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import bot from "../assets/bot.png";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus as darkTheme } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Message({ message }: { message: any }) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isAI = message.role === "assistant" || message.role === "model";

  const isNewMessage =
    isAI &&
    new Date().getTime() - new Date(message.createdAt).getTime() < 10000;

  const [displayedText, setDisplayedText] = useState(
    isNewMessage ? "" : message.content,
  );

  useEffect(() => {
    if (isNewMessage) {
      let currentText = "";
      let wordIndex = 0;
      const words = message.content ? message.content.split(" ") : [];

      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex];
          setDisplayedText(currentText);
          wordIndex++;
        } else {
          clearInterval(interval);
        }
      }, 25);

      return () => clearInterval(interval);
    }
  }, [message.content, isNewMessage]);

  const handleSpeak = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((v) => v.lang.includes("en-US")) || voices[0];
    utterance.rate = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex w-full ${
        isAI ? "justify-start" : "justify-end"
      } px-2 md:px-4 mb-4 md:mb-6`}
    >
      <div className="flex flex-col gap-2 w-full max-w-[85%] sm:max-w-[75%] md:max-w-xl lg:max-w-2xl">
        <div
          className={`flex items-center gap-2 ${
            isAI ? "justify-start" : "justify-end"
          }`}
        >
          {isAI ? (
            <>
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-linear-to-tr p-0.5 shrink-0">
                <div className="h-full w-full rounded-full bg-[#080816] flex items-center justify-center overflow-hidden">
                  <img
                    src={bot}
                    alt="AI Avatar"
                    className="w-full h-full object-cover scale-110"
                  />
                </div>
              </div>
              <span className="text-[9px] md:text-[10px] text-[#D1C4CE]/30 font-medium">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </>
          ) : (
            <>
              <span className="text-[9px] md:text-[10px] text-[#D1C4CE]/30 font-medium">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#827DBE] flex items-center justify-center shrink-0 shadow-lg shadow-[#C96D50]/20">
                <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            </>
          )}
        </div>

        {/* Bubble Style */}
        <div
          className={`
          p-3 md:p-4 rounded-2xl backdrop-blur-xl border shadow-xl transition-all
          ${
            isAI
              ? "bg-[#3C3B5E]/40 border-white/10 text-[#D1C4CE] rounded-bl-sm"
              : "bg-linear-to-r bg-[#827DBE] text-white rounded-br-sm border-white/20"
          }
        `}
        >
          {/* Markdown Content */}
          <div
            className={`prose prose-invert prose-xs md:prose-sm max-w-none wrap-break-words overflow-x-hidden ${
              isAI ? "prose-p:text-[#D1C4CE]/90" : "prose-p:text-white"
            }`}
          >
            <ReactMarkdown
              components={{
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="my-2 md:my-3 rounded-lg md:rounded-xl overflow-hidden border border-white/10 text-[11px] md:text-sm shadow-2xl">
                      <SyntaxHighlighter
                        style={darkTheme}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          background: "#080816",
                          padding: "0.75rem md:1rem",
                          margin: 0,
                        }}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code
                      {...props} 
                      className={`${
                        isAI
                          ? "bg-[#080816]/50 text-[#827DBE]"
                          : "bg-black/20 text-white"
                      } px-1 py-0.5 rounded text-[10px] md:text-xs break-all font-mono`}
                    >
                      {children}
                    </code>
                  );
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto w-full my-2">
                      <table className="min-w-full border-collapse border border-white/10">
                        {children}
                      </table>
                    </div>
                  );
                },
              }}
            >
              {isAI ? displayedText : message.content}
            </ReactMarkdown>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3 border-t border-white/5 pt-2">
            <button
              onClick={handleCopy}
              className={`p-2 md:p-1.5 rounded-full transition active:scale-90 ${
                isAI
                  ? "bg-white/5 hover:bg-white/10"
                  : "bg-black/10 hover:bg-black/20"
              }`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 md:w-3 md:h-3 text-green-400" />
              ) : (
                <Copy
                  className={`w-3.5 h-3.5 md:w-3 md:h-3 ${
                    isAI ? "text-[#827DBE]" : "text-white/70"
                  }`}
                />
              )}
            </button>

            {isAI && (
              <button
                onClick={handleSpeak}
                className="p-2 md:p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition active:scale-90"
              >
                <Volume2
                  className={`w-3.5 h-3.5 md:w-3 md:h-3 ${
                    isSpeaking
                      ? "text-[#C96D50] animate-pulse"
                      : "text-[#D1C4CE]/60"
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
