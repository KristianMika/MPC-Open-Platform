import React from "react";
import { Route, Switch } from "react-router-dom";
import { RecoilRoot, useRecoilState } from "recoil";

import "./App.css";
import { Header } from "./components/Header";
import { SmpcRsa } from "./components/SmpcRsa";
import { Myst } from "./components/Myst";
import { Home } from "./components/Home";
import EventBus from "@vertx/eventbus-bridge-client.js";
import { MystSetup } from "./components/MystSetup";
import { DebugAreaButton } from "./components/DebugAreaButton";
import { eventbusSocketState } from "./store/atom";
import { GreyFilter } from "./components/GreyFilter";
import { GlobalComponent } from "./components/GlobalComponent";
import { Delayed } from "./components/Delayed";

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
					<Route exact path="/protocols/Myst">
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
