// server.js
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
