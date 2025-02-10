// In Terminal.tsx
import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalRef {
  clear: () => void;
  sendCommand: (command: string) => void;
}

const Terminal = forwardRef<TerminalRef>((props, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useImperativeHandle(ref, () => ({
    clear: () => {
      if (xtermRef.current) {
        xtermRef.current.clear();
      }
    },
    sendCommand: (command: string) => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(command + "\n");
      }
    }
  }));

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1a1b26',
        foreground: '#a9b1d6',
        cursor: '#c0caf5',
        selection: '#33467C',
      },
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.open(terminalRef.current);

    // Connect to WebSocket
    const socket = new WebSocket('ws://' + window.location.host + '/ws');
    socketRef.current = socket;

    socket.onopen = () => {
      term.writeln('Connected to terminal backend');
    };

    socket.onmessage = (event) => {
      term.write(event.data);
    };

    socket.onerror = () => {
      term.writeln('WebSocket connection error');
    };

    socket.onclose = () => {
      term.writeln('Connection closed');
    };

    // Send terminal input to WebSocket
    term.onData((data) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    });

    // Handle terminal resizing
    const resizeHandler = () => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
          // Optionally send new dimensions to backend
          // socket.send(JSON.stringify({ cols: term.cols, rows: term.rows }));
        } catch (e) {
          console.error('Error fitting terminal:', e);
        }
      }
    };

    const resizeObserver = new ResizeObserver(resizeHandler);
    resizeObserver.observe(terminalRef.current);
    window.addEventListener('resize', resizeHandler);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeHandler);
      resizeObserver.disconnect();
      socket.close();
      term.dispose();
    };
  }, []);

  return <div ref={terminalRef} className="h-full w-full" />;
});

export default Terminal;
