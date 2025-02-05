// const express = require('express');
// const app = express();

// app.get('/Ping', (req, res) => {
//     res.send('Pong');
//     });

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
//     });

const express = require("express");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
    res.send("MongoDB Atlas is connected to VS Code!");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});