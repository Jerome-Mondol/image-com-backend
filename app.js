// server.js
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for frontend connection
app.use(cors());

// Set up multer for file uploads, memory storage to process file buffer
const upload = multer({ storage: multer.memoryStorage() });

// Compress endpoint
app.post("/api/compress", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    // Compress the image using sharp
    const compressedBuffer = await sharp(req.file.buffer)
      .jpeg({ quality: 60 }) // Adjust quality here (1-100)
      .toBuffer();

    // Optional: log compression info
    logCompression(req.ip, req.file.originalname, req.file.size, compressedBuffer.length);

    // Send compressed image back
    res.set({
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="compressed-${req.file.originalname}"`,
    });
    res.send(compressedBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Compression failed");
  }
});

// Logging function (write to logs.json)
function logCompression(ip, filename, originalSize, compressedSize) {
  const logEntry = {
    time: new Date().toISOString(),
    ip,
    filename,
    originalSize,
    compressedSize,
    reductionPercent: (((originalSize - compressedSize) / originalSize) * 100).toFixed(2),
  };

  const logFile = path.join(__dirname, "logs.json");
  let logs = [];
  if (fs.existsSync(logFile)) {
    try {
      logs = JSON.parse(fs.readFileSync(logFile));
    } catch {}
  }
  logs.push(logEntry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
