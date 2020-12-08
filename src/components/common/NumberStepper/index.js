import React, {Component} from 'react';
import style from './style.less';

export default class NumberStepper extends Component {
	constructor(props) {
		super(props);
		this.state = {
			count: this.props.defaultCount
		}
	}

	componentWillReceiveProps(nextProps) {
		const prevCurStandardInd = this.props.currentStandardInd,
			nextCurStandardInd = nextProps.currentStandardInd;		
		
		if((nextCurStandardInd != prevCurStandardInd) || this.props.forceUpdate) {
			this.setState({
				// count: this.props.defaultCount
				count: nextProps.defaultCount
			})
		}
	}

	render() {
		const {count} = this.state;
		return 	<div className="numberstepper">
					<span className="subtract" onClick={this._onSubtract.bind(this)}>-</span>	
					<span className="count">{count}</span>
					<span className="plus" onClick={this._onPlus.bind(this)}>+</span>
				</div>
	}

	_onSubtract() {
		console.log(this.props.minCount,"minCount....");
		let count = this.state.count - 1;
		if(count < this.props.minCount) {
			this.props.warnTip && this.props.warnTip(1)
		}
		count = count > this.props.minCount ? count : this.props.minCount;
		this.setState({
			count: count
		})
		this._callBackParent(count);
	}

	_onPlus() {
		let {count} = this.state;
		const {maxCount} = this.props;
		if(count >= maxCount ){
			this.props.warnTip && this.props.warnTip(2)
			console.log("this.props.warnTip....")
			return;
		} 
		count = ++count;
		this.setState({
			count: count
		});
		this._callBackParent(count);
	}

	_callBackParent(count) {
		this.props.setCount(count);
	}
}