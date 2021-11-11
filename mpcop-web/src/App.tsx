import { Route, Switch } from "react-router-dom";
import { RecoilRoot } from "recoil";

import "./App.css";
import { Header } from "./components/Header";
import { SmpcRsa } from "./components/SmpcRsa";
import { Myst } from "./components/Myst";
import { Home } from "./components/Home";
import { DebugAreaButton } from "./components/DebugAreaButton";
import { GreyFilter } from "./components/GreyFilter";
import { GlobalComponent } from "./components/GlobalComponent";
import { Ping } from "./components/Ping";
import { Attribution } from "./components/Attribution";

const App = (): JSX.Element => {
	return (
		<RecoilRoot>
			<div className="App">
				<GreyFilter />

				<GlobalComponent />
				<Header />
				<Switch>
					<Route exact path="/">
						<Home />
					</Route>
					<Route exact path="/protocols/myst">
						<Myst />
					</Route>
					<Route exact path="/protocols/smpcrsa">
						<SmpcRsa />
					</Route>
					<Route exact path="/ping">
						<Ping />
					</Route>
				</Switch>
				<DebugAreaButton />
				
			</div>
			<Attribution />
			
		</RecoilRoot>
	);
};

export default App;
