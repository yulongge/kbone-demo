import React, {Component} from 'react';
import { result } from 'lodash';

class AutoRemountComponent extends Component {
	componentWillReceiveProps(nextProps) {
		const ts = result(nextProps, 'location.state.timestamp');
		if (ts !== this._remountFlag) {
			this.componentDidMount();
			console.log('[componentWillReceiveProps] auto reload', this._remountFlag, ts);
			this._remountFlag = ts;
		}
	}
}

export default AutoRemountComponent;