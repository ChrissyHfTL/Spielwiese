/// <reference path="../../typings/socket.io/socket.io.d.ts" />

import {bootstrap, Component} from "../../node_modules/angular2/ts/angular2";

@Component({
	selector: "my-app",
	template: "<h1>My first Angular2 App</h1>"
})
class AppComponent{}

bootstrap(AppComponent);