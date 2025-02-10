const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const os = require("os");
const pty = require("node-pty");
const cors = require("cors");

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));
app.use(express.json()); // Add this for JSON body parsing

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store PTY processes for each connection
const ptyProcesses = new Map();

wss.on("connection", (ws) => {
    console.log("New client connected");
    const shell = os.platform() === "win32" ? "cmd.exe" : "bash";
    const ptyProcess = pty.spawn(shell, [], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env,
    });

    // Store the PTY process with a unique ID
    const clientId = Date.now().toString();
    ptyProcesses.set(clientId, { pty: ptyProcess, ws });

    ptyProcess.on("data", (data) => {
        ws.send(data);
    });

    ws.on("message", (msg) => {
        ptyProcess.write(msg);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        ptyProcess.kill();
        ptyProcesses.delete(clientId);
    });
});

// Add new API endpoint to send commands
app.post("/api/terminal/command", (req, res) => {
    const { command, clientId } = req.body;
    
    if (!command) {
        return res.status(400).json({ error: "Command is required" });
    }

    // If clientId is provided, send to specific terminal
    if (clientId && ptyProcesses.has(clientId)) {
        const { pty } = ptyProcesses.get(clientId);
        pty.write(command + "\n");
        return res.json({ success: true, message: "Command sent to specific terminal" });
    }

    // Otherwise broadcast to all terminals
    ptyProcesses.forEach(({ pty }) => {
        pty.write(command + "\n");
    });
    
    res.json({ success: true, message: "Command broadcast to all terminals" });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));