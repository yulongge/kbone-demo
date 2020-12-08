import React, {Component} from 'react';
import styles from './styles.less';
import locale from "./locale";
import AdvertiseItem from "./AdvertiseItem";
import AppState from '../../stores/AppState';
import {getQrcode, getParam} from '../../utils/util';

export default class Advertise extends Component {
	constructor(props) {
		super(props);
	}
	componentWillMount() {

	}


	toPage(type, data) {
		console.log(type, data,"type, data....")
		if(!type) return;
		if(typeof data == "object" && Object.keys(data).length <= 0) return;
		if(data.status == 9) {
			AppState.showWarn(locale.noData);
			return;
		}
		let uid=this.props.uid;		
		const paramUid = getParam('uid');		
		console.log(paramUid, paramUid && paramUid != "null" && paramUid != 'undefined', 'paramUid');
		if(paramUid && paramUid != "null" && paramUid != 'undefined') {
			uid = paramUid;
		}
		switch(type) {
			case 'product':
				//window.location.href = "/mall/product/detail/" + data.pid;
				location.assign(`/v2/product/detail/${data.pid}?qrcode=${getQrcode()}&uid=${uid}`);
				break;
			case 'category':
				//window.location.href = "/mall?cid=" + data.cid;
				location.assign(`/v2/category/${data.cid}?qrcode=${getQrcode()}&uid=${uid}`);
				break;
			case 'link':
				location.assign(data.name);
				break;
			default:
				break;
		}
	}


	render() {
		const {adData} = this.props;

		let { data } = adData ;
		data = data && data.length && data.filter(ad => (!!ad.pictures && ad.pictures.length));
		if(!data) return null;
		return 	<div className={styles.advertise} >	
					
					{
						data.map((item, aidx)=> {
							return 	<AdvertiseItem
									key={aidx}
									data={item}
									toPage={this.toPage.bind(this)}
									/>
						}) 
					}	
					
				</div>
	}
}