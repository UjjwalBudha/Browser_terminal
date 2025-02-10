const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const os = require("os");
const pty = require("node-pty");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow frontend connections

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    console.log("New client connected");

    // Start a shell process (Bash for Linux/macOS, CMD/PowerShell for Windows)
    const shell = os.platform() === "win32" ? "cmd.exe" : "bash";
    const ptyProcess = pty.spawn(shell, [], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env,
    });

    // Send shell output to frontend
    ptyProcess.on("data", (data) => {
        ws.send(data);
    });

    // Receive input from frontend
    ws.on("message", (msg) => {
        ptyProcess.write(msg);
    });

    // Handle disconnect
    ws.on("close", () => {
        console.log("Client disconnected");
        ptyProcess.kill();
    });
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
