// middlewares/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { sanderUniqueCode, reciverUniqueCode } = req.body;
    let folder = "uploads";

    const ext = path.extname(file.originalname).toLowerCase();

    if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) folder += "/images";
    else if ([".mp4", ".mov", ".avi"].includes(ext)) folder += "/videos";
    else folder += "/files";

    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const { sanderUniqueCode, reciverUniqueCode } = req.body;
    const name = `S${sanderUniqueCode}_R${reciverUniqueCode}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, name);
  },
});

export const upload = multer({ storage });
