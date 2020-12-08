import React, {Component} from 'react';
import styles from './style.less';

export default class CountDown extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hours: 0,
			minutes: 0,
			seconds: 0,
			nowtime: Date.now(), //props.nowtime ? props.nowtime : Date.now(),
			timestart: props.timestart ? props.timestart : Date.now(),
			timeto: props.timeto ? props.timeto : 0,
			interval: 1000,
			diff: 0
		}
	}

	componentWillMount() {
		let {nowtime, timestart, timeto} = this.state;
		if(nowtime < timestart) { //未开始
			timeto = timestart;
		}
		this.setState({
			diff: timeto - nowtime
		})
	}

	componentWillReceiveProps(nextProps) {
		let nextTimeStart = nextProps.timestart,
			nextTimeTo = nextProps.timeto,
			nextNowTime = Date.now();
		const {nowtime, timestart, timeto} = this.state;
		if(nextNowTime != nowtime || nextTimeStart != timestart || nextTimeTo != timeto) {
			if(nextNowTime < nextTimeStart) {
				nextTimeTo = nextTimeStart;
			}
			this.setState({
				nowtime: nextNowTime,
				timestart: nextTimeStart,
				timeto: nextTimeTo,
				diff: nextTimeTo - nextNowTime
			}, () => {
				clearInterval(this._itv);
				this._startTimer();
			})
		}
		
		
	}

	componentDidMount() {
		this._ready = true;
		this._startTimer();
	}

	componentWillUnmount() {
		clearInterval(this._itv)
	}

	render() {
		const {hours, minutes, seconds} = this.state;

		return 	<div className={styles.countdown_component}>
					<span className="time">{hours}</span>
					<span className="line">:</span>
					<span className="time">{minutes}</span>
					<span className="line">:</span>
					<span className="time">{seconds}</span>
				</div>
	}

	finish() {
		this.props.finish();
	}

	_startTimer() {
		const _me = this;
		if ((isNaN(this.state.diff)) || !this.state.diff || this.state.diff < 0) return;
		this._itv = setInterval(
			function() {
				if ((isNaN(_me.state.diff)) || !_me.state.diff || _me.state.diff < 0) {
					clearInterval(_me._itv);
					_me.finish();
					return;
				}

				const
					d = parseInt( _me.state.diff / 1000 / 24 / 60 / 60),
					h = parseInt( (_me.state.diff) / 1000 / 60 / 60 ),
					m = parseInt( (_me.state.diff - h*1000*60*60) / 1000 / 60 ),
					s = parseInt( (_me.state.diff - h*1000*60*60 - m*1000*60) / 1000 );

				_me.setState({
					day: d,
					hours: h,
					minutes: m,
					seconds: s
				});
				_me.state.diff -= _me.state.interval;
			},
			_me.state.interval
		);
	}
}