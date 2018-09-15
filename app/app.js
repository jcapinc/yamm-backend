
module.exports = class App{

	static new(){
		return new this();
	}
	dispatch(request,response){
		let actionName = this.getActionName(request);
		let controllerName = this.getControllerName(request);
		let controllerClass = require('./controllers/'+controllerName+'.js');
		let controller = new controllerClass();
		return controller[actionName](request,response);
	}
	getActionName(request){
		return 'postImportFile';
	}
	getControllerName(request){
		return 'ImportController';
	}
	test(){
		console.log("tset?");
	}
}

