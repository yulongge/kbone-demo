import React from 'react';
import style from './style.less';
import locale from "../Market/locale";
import AppState from '../../stores/AppState';
import {getQrcode, getParam} from '../../utils/util';


export default class Menu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {

		}
	}

	toPage(type, data) {
		if(typeof data == "object" && Object.keys(data).length <= 0) return;
		if(data.status == 9) {
			AppState.showWarn(locale.market.noData);
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
				location.assign(data);
				break;
			default:
				break;
		}
	}

	render() {
		const {
			menuData
		} = this.props;

		return(
			<div className={style.menu} >	
				{
					!!(menuData.data && menuData.data.length && menuData.data.length) &&
					<ul>
					{ 
						
						menuData.data.map((item,idx)=>{
							return <li  key={idx} onClick={this.toPage.bind(this,item.type,item.linkDetail)}><img src={item.icon} /></li>
						})
                    }
					</ul>
				}			
			</div>
		)
	}
}