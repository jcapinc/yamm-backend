const express = require('express');
const app = require('./app/app.js');
const multer = require('multer');
const upload = multer({dest: process.env.UPLOAD_DIRECTORY});

require('dotenv').config();

let dispatch = (req,res) => app.new().dispatch(req,res)
let pattern = '/[A-Za-z\/_]+';
let expressApp = express();

expressApp.get('/' , (request,response) => {response.send("hello world");});
expressApp.get('/import/import_file', upload.single('transactions'), dispatch);

expressApp.get(pattern, dispatch);
expressApp.post(pattern, dispatch);
expressApp.put(pattern, dispatch);
expressApp.patch(pattern, dispatch);

expressApp.listen(process.env.EXPRESS_PORT, () => {
	console.log("Serving on " + process.env.EXPRESS_PORT)
});

