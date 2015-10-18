

import {bootstrap, Component} from "../node_modules/angular2/ts/angular2";

@Component({
	selector: "my-app",
	template: '<h1>{{title}}</h1><h2>{{hero}} details!</h2>'
})
class AppComponent {
      public title = 'Tour of Heroes';
      public hero = 'Windstorm';
}

bootstrap(AppComponent);