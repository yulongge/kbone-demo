import React, {Component} from 'react';
import {getQrcode, getParam, getParams} from '../../utils/util';
import styles from './style.less';

export default class CompleteInfoModal extends Component {
	constructor(props) {
		super(props);
	}
	componentWillMount() {
		console.log('componentWillMount.....FooterNav');
	}

	//去完善弹框
	toPerfect() {
		let marketingParams = getParams();  
		let { pid } = this.props.data
		console.log('[marketingParams]:', marketingParams);
		let url = `/v2/mine/perfect?pid=${pid}&qrcode=${getQrcode()}&uid=${getParam('uid')}`;
		let paramsKeys = Object.keys(marketingParams);
		paramsKeys.forEach(item=>{
			if(item != 'qrcode' || item != 'uid') {
				if(marketingParams[item] != "undefined") {
					url += `&${item}=${marketingParams[item]}`;
				}
			}
		});
		location.assign(url);
	}

	render() {
		const { data} = this.props;
			
		return 	<div className="perfect-guide">
				<div className="mask"></div>
				<div className="guide-box">
					<img src={data.perfectPic} onClick={this.toPerfect.bind(this)}/>
					<div className="close-box">
						<span></span>
						<div className="close-switch" onClick={this.props.onCloseModal.bind(this)}></div>
					</div>
				</div>
			</div>
                  
	}


}