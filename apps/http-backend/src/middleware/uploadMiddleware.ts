import multer from "multer";
import path from "path";

// Multer storage configuration (store files temporarily)
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
