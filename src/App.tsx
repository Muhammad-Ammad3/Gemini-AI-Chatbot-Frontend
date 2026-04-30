import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import Chat from "./components/Chat";
import { MessageCircle, Zap, ArrowRight } from "lucide-react";
import chat from "./assets/chat.png";

function App() {
  return (
    <div className="min-h-screen bg-[#080816] text-[#D1C4CE] selection:bg-[#5654A6] font-sans antialiased overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] md:w-[50%] h-[50%] bg-[#5654A6]/20 rounded-full blur-[80px] md:blur-[140px] animate-pulse"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[70%] md:w-[50%] h-[50%] bg-[#827DBE]/10 rounded-full blur-[80px] md:blur-[140px]"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      {/* Header */}
      <SignedIn>
        <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-[#080816]/60 backdrop-blur-xl z-50 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br rounded-lg flex items-center justify-center shadow-lg">
              <img src={chat} alt="" />
            </div>
            <span className="font-bold tracking-tight text-white block">
              AI Gemini Chatbot
            </span>
          </div>
          <div className="flex items-center gap-4">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: { avatarBox: "w-9 h-9 border border-white/10" },
              }}
            />
          </div>
        </header>
      </SignedIn>

      <main className="relative z-10 w-full">
        <SignedOut>
          <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-6">
            <div className="mb-6 md:mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-green-700 animate-ping"></div>
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#D1C4CE]/70">
                Now Powered by Gemini 2.5 Pro
              </span>
            </div>

            <div className="bg-[#3C3B5E]/40 backdrop-blur-3xl rounded-4xl md:rounded-[3rem] p-6 sm:p-10 md:p-14 max-w-2xl w-full border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#827DBE]/20 blur-[80px] group-hover:bg-[#827DBE]/30 transition-colors duration-700"></div>

              <div className="relative text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter text-white mb-4 md:mb-6 leading-tight">
                  Build <span className="text-[#827DBE]">Beyond</span> Limits.
                </h1>

                <p className="text-[#D1C4CE]/80 text-sm md:text-lg mb-8 md:mb-10 max-w-md mx-auto leading-relaxed">
                  The most sophisticated AI workspace for modern developers.
                  Secure, fast, and remarkably intelligent.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 text-left">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-[#827DBE] mb-2" />
                    <h3 className="text-sm font-bold text-white">
                      Contextual Memory
                    </h3>
                    <p className="text-xs text-[#D1C4CE]/60 mt-1">
                      Remembers past prompts for seamless flow.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 text-left">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-[#C96D50] mb-2" />
                    <h3 className="text-sm font-bold text-white">
                      Real-time Streaming
                    </h3>
                    <p className="text-xs text-[#D1C4CE]/60 mt-1">
                      Zero latency responses with Vercel AI.
                    </p>
                  </div>
                </div>

                <SignInButton mode="modal">
                  <button className="group relative w-full py-4 md:py-5 px-8 bg-[#C96D50] text-white font-black rounded-xl md:rounded-2xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(201,109,80,0.4)] active:scale-95 flex items-center justify-center gap-3 text-sm md:text-base">
                    Get Access Now
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignInButton>

                <p className="mt-6 md:mt-8 text-[10px] md:text-xs text-[#D1C4CE]/40 font-medium uppercase tracking-widest">
                  Trusted by 10k+ developers worldwide
                </p>
              </div>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="pt-16 h-screen flex flex-col w-full overflow-hidden bg-[#080816]">
            <Chat />
          </div>
        </SignedIn>
      </main>
    </div>
  );
}

export default App;
