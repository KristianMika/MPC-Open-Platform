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

function App() {
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
				</Switch>
				<DebugAreaButton />
			</div>
		</RecoilRoot>
	);
}

export default App;
