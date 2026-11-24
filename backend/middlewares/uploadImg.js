const multer = require("multer");
const path = require("path");
const { saveLogToDB } = require("../functions");

function generateHexFilename() {
  const date = new Date();
  const yyyyMMdd = date.toISOString().slice(0, 10).replace(/-/g, "");

  const hexRandom = [...Array(12)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

  return `${yyyyMMdd}-${hexRandom}`;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/images/"); // asegúrate de que exista
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // conserva la extensión original
    const filename = `${generateHexFilename()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 150 * 1024 * 1024 }  // Limita el tamaño del archivo a 150 MB
});

module.exports = upload;
