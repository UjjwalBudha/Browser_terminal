import React from 'react';
import { Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import Terminal from './Terminal';

function App() {
  const terminalRef = React.useRef<{ clear: () => void } | null>(null);

  const handleClear = () => {
    terminalRef.current?.clear();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TerminalIcon className="h-8 w-8 text-green-400" />
              <h1 className="text-2xl font-bold">Terminal Simulator</h1>
            </div>
            <button
              onClick={handleClear}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <Trash2 className="h-5 w-5" />
              <span>Clear Terminal</span>
            </button>
          </div>
        </header>

        <main className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
          <div className="h-8 bg-gray-700 flex items-center px-4 space-x-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="h-[600px] p-4">
            <Terminal ref={terminalRef} />
          </div>
        </main>

        <footer className="mt-8 text-center text-gray-400">
          <p>Type 'help' to see available commands</p>
        </footer>
      </div>
    </div>
  );
}

export default App;