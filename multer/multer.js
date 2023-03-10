const multer= require('multer')


const fileStorageEngine =multer.diskStorage({
    destination :(req,file,cb)=>{
      cb(null,"./public/image")
    },
    filename : (req,file,cb)=>{
      cb(null,Date.now()+"--"+file.originalname);
    },
  })
  
  module.exports = upload = multer({ storage: fileStorageEngine})
  