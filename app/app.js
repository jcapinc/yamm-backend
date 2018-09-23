
module.exports = class App{

	static new(){
		return new this();
	}
	dispatch(request,response){
		let matchresult = /\/(.+)\/(.+)(.*)/.exec(request.path);
		let controllerName = matchresult[1]+"Controller";
		let actionName = request.method.toLowerCase() + matchresult[2];
		let args = matchresult[3];
		let controllerClass = require('./controllers/'+controllerName+'.js');
		let controller = new controllerClass();
		return controller[actionName](request,response,args);
	}
}

