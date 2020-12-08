import React from 'react';
import style from './style.less';
import locale from "../Advertise/locale";
import Carousel from "../Advertise/carousel";
import AppState from '../../stores/AppState';
import {getQrcode, getParam} from '../../utils/util';
export default class LoopBanner extends React.Component {
	constructor(props) {
		super(props);
		this.state={
			activeIndex:0,
			offset: 0,
			clientWidth: document.body.clientWidth
		}
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
		const {
			loopbannerData,
			isHaveBar
		} = this.props;
		let { pictures, style } = loopbannerData;
		let { widthtype,radius} = style;
		const { clientWidth } = this.state;

		pictures = pictures.length && pictures.filter(item=> item.img);
		let cWidth = widthtype == 1 ? clientWidth - 30 : clientWidth;
		let componentClass;
		if(widthtype == 1) {

			componentClass = 'notfill';

			
		}else if(widthtype == 0) {

			componentClass = 'fill';
			
		}
		return (
			<div 
				className={`loopbanner ${componentClass} ${isHaveBar ? '' : "noBar"}`}>
				<div className={`routinebox ww ${44}`}>
					<div className="picturesbox">
					{ 
						pictures && pictures.length > 0 ?
						<Carousel 
							widthtype={widthtype} 
							width={cWidth}
							height="100%" 
							radius={radius} 
							data={style}>
							{
							pictures.map((value, index) =>(
								<img 
								src={value.img+'?x-oss-process=image/auto-orient,1'} 
								alt=""  
								key={index}
								onClick={this.toPage.bind(this,value.type, value.linkDetail )}/>
							))}
                </Carousel>
            : null
					}
					</div>

				</div>
					
			</div>
		)
	}
}