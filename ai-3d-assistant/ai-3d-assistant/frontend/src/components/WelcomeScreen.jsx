import { actions } from "../store/useAppStore.js";

export default function WelcomeScreen() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-surface/80 backdrop-blur-md animate-slide-in">
      <div className="max-w-2xl w-full flex flex-col items-center text-center gap-8">
        {/* Sleek icon/logo representation */}
        <div className="w-28 h-28 rounded-[36px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center ring-8 ring-blue-50 dark:ring-blue-900/20">
          <span className="text-5xl text-white font-black drop-shadow-md">△</span>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-black text-primary tracking-tight drop-shadow-md">
            AI 2D → 3D <br /> <span className="bg-gradient-to-r from-blue-700 to-purple-800 bg-clip-text text-transparent">Design Studio</span>
          </h1>
          <p className="text-lg font-black text-secondary max-w-lg mx-auto bg-white/40 px-3 py-1 rounded-lg">
            Transform flat sketches into incredibly detailed, interactive 3D models using next-generation AI.
          </p>
        </div>

        <button 
          onClick={() => actions.startApp()}
          className="mt-6 px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:from-blue-500 dark:to-indigo-600 text-white font-extrabold text-xl rounded-full shadow-[0_10px_40px_-10px_rgba(37,99,235,0.8)] hover:shadow-[0_20px_50px_-10px_rgba(37,99,235,0.95),_0_0_20px_rgba(99,102,241,0.5)] hover:-translate-y-1.5 transition-all duration-300 outline outline-4 outline-blue-600/20 hover:outline-blue-500/50"
        >
          Enter the Lab <span className="ml-2 font-normal animate-pulse inline-block">→</span>
        </button>
      </div>
    </div>
  );
}
