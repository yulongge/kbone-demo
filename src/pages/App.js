import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { observer, Provider } from 'mobx-react';
import cookie from 'js-cookie';
import { Toast, Toptips, Dialog } from 'react-weui';
import VConsole from 'vconsole';
import lessRem from 'less-rem';
import wx from '../utils/wx';
import store from '../stores';
import styles from './App.less';
import Index from './Index';


@observer
class App extends Component {
	
	constructor(props) {
		super(props);
		if(location.href.indexOf("perfect") < 0) {
			lessRem(20);
		}
		// let vConsole = new VConsole();
		store.AppState.authorizeInit();
	}

	componentDidMount() {
		if(this.isIphonex()) {
			let rootDom = document.querySelector('#root');
			const deviceWith = document.body.clientWidth;
			rootDom.style.width = (deviceWith + 1) + "px";
		}
		store.AppState.setMarketingDid();
	}

	isIphonex() {
		if(typeof window !== 'undefined' && window) {
			return /iphone/gi.test(window.navigator.userAgent) && window.screen.height >= 812;
		}
		return false;
	}

	render() {
		return <Provider store={store}>
			<Router ref={store.AppState.initRouter}>
				<div className={styles.app}>
					

					<Switch>
						<Route exact path="/" component={Index} />
						<Route exact path="/index" component={Index} />
					</Switch>

				</div>
			</Router>
		</Provider>
	}
}

export default App;
