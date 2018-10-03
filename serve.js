const express = require('express');
const multer = require('multer');
const passport = require("passport");
const local = require('passport-local').Strategy;
const app = require('./app/app.js');
const jwt = require('jsonwebtoken');
const md5 = require('blueimp-md5');
const passportJWT = require("passport-jwt");
const parser = require("body-parser");

require('dotenv').config();

const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const upload = multer();
let pattern = '\/[A-Za-z\/_]+';
let expressApp = express();
expressApp.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

expressApp.use(parser.json()); 

let dispatch = (req,res) => {
	console.log("dispatching " + req.method + " " + req.path);
	return app.new().dispatch(req,res);
};

let AuthMethod = function(req,res){
	return passport.authenticate('local', {session: false}, (err, user, info) => {
		if (err || !user) return res.status(400).json({
			message: 'Something is not right',
			user   : user
		});
		req.login(user, {session: false}, (err) => {
			if (err) res.send(err);
			// generate a signed son web token with the contents of user object and return it in the response
			const token = jwt.sign(user, process.env.JWT_SECRET,{expiresIn:'1w'});
			return res.json({user, token});
		});
	})(req, res);
};

passport.use(new local({},(user,pass,callback) => {
	if(user !== process.env.PRIMARY_USERNAME) 
		return callback(null,false);
	if(md5(pass) !== process.env.PRIMARY_PASSWORD)
		return callback(null,false);
	return callback(null,{
		id: 1, username: process.env.PRIMARY_USER
	});
}));

passport.use(new JWTStrategy({
		jwtFromRequest: ExtractJWT.fromUrlQueryParameter('authorization'),
		secretOrKey   : process.env.JWT_SECRET
	},
	(jwtPayload, cb) => {
		if(jwtPayload.id === 1){
			return cb(null,{});
		}
		return cb(unauthorized)
	}
));


expressApp.post('/login', (req,res,next) => {
	AuthMethod(req,res);
});

let appRouter = express.Router();
expressApp.use('/v1',passport.authenticate('jwt',{session:false}),appRouter);
appRouter.get('/' , (request,response,next) => {response.send("hello world");});
appRouter.post('/Import/ImportFile', upload.single('transactions'), (req,res) => {
	console.log("upload triggered");
	return dispatch(req,res);
});

appRouter.get(pattern, dispatch);
appRouter.post(pattern, dispatch);
appRouter.put(pattern, dispatch);
appRouter.patch(pattern, dispatch);
appRouter.delete(pattern, dispatch);

expressApp.listen(process.env.EXPRESS_PORT, () => {
	console.log("Serving on " + process.env.EXPRESS_PORT)
});

