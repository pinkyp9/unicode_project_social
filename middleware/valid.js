import pkg from "mongoose";
import multer from "multer";
import { extname } from "path"; // Correct the import for extname

const { Path } = pkg;

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "C:/Users/Pinky Pamecha/OneDrive/Desktop/qoura unicode/alluploads/profilePics");
    },
    filename:(req, file, cb)=> {
        let ext = extname(file.originalname); // Use extname to get the file extension
        cb(null, ext);
    }
});

var upload = multer({
    storage: storage,
     fileFilter: (req, file, cb)=> {
         if (
             file.mimetype === "image/png" || // Correct mimetype strings
             file.mimetype === "image/jpeg" // Correct mimetype strings
             
         ) {
             cb(null, true);
         } else {
             console.log('Only jpg/png files supported!');
             callback(null, false);
         }
     },
     limits: {
         fileSize: 1024 * 1024 * 2
     }
});

var storageCloudinary = multer.diskStorage({
    filename:(req, file, cb)=> {
        let ext = extname(file.originalname); // Use extname to get the file extension
        cb(null, ext);
    }
});

var uploadCloudinary = multer({
    storage: storageCloudinary,
     fileFilter: (req, file, cb)=> {
         if (
             file.mimetype === "image/png" || // Correct mimetype strings
             file.mimetype === "image/jpeg" // Correct mimetype strings
             
         ) {
             cb(null, true);
         } else {
             console.log('Only jpg/png files supported!');
             cb(null, false);
         }
     },
     limits: {
         fileSize: 1024 * 1024 * 2
     }
});

export { upload , uploadCloudinary };