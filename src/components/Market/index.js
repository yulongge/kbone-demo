import React, {Component} from 'react';
import styles from './style.less';
import locale from "./locale";
import CountDown from "Components/common/CountDown";
import AppState from '../../stores/AppState';
import {getQrcode, getParam} from '../../utils/util';

export default class Market extends Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {

	}

	onTimerFinish(ind, status) {
		this.props.onTimerFinish();
	}

	toPage(type, linkDetail) {
		const {allData} = this.props;
		let {uid} = allData ? allData : {};
		if(getParam('uid') && getParam('uid') != "null" && getParam('uid') != 'undefined') {
			uid = getParam('uid');
		}
		if(typeof linkDetail == "object" && Object.keys(linkDetail).length <= 0) {
			return;
		}
		if(linkDetail.status == 9) {
			AppState.showWarn(locale.market.noData);
			return;
		}
		switch(type) {
			case "product":
				location.assign(`/v2/product/detail/${linkDetail.pid}?qrcode=${getQrcode()}&uid=${uid}`);
				//location.href = `/mall/product/detail/${linkDetail.pid}`;
				break;
			case "spike":
				location.assign(`/mall/spike/detail/${linkDetail.aid}/${linkDetail.pid}?qrcode=${getQrcode()}`);
				break;
			case "category":
				location.assign(`/v2/category/${linkDetail.cid}?qrcode=${getQrcode()}&uid=${uid}`);
				break;
			case "link":
				location.assign(linkDetail.name);
				break;
			default:
				break;
			
		}
		
	}

	render() {
		const {data, type, activeCompIndex, activeIndex, selectMarketIndex, selectedLinkDetail} = this.props;

		const {style} = data;
		let newStyle = {};
		if(style.mode) {
			newStyle = {
				borderRadius: "10px"
			}
		}
		
		return 	<div className={styles.market}>	
					{
						data.data.length >0 &&
						data.data.map((item, index)=> {
							return <div
									onClick={this.toPage.bind(this, item.type, item.linkDetail)} 
									className={
										activeCompIndex == type ?
										selectMarketIndex == index ? 'market_con active' : 'market_con' : 'market_con' 
									} 
									key={index} >
									<div className="market_item" style={{...newStyle}}>
										<div className="item_panel">
											{
												item.img &&
												<img src={item.img+'?x-oss-process=image/auto-orient,1'} style={{...newStyle}}/>
											}
											
										</div> 
										<div className="market_label" style={{backgroundColor: item.style.bgColor, color: item.style.color}}>
											{
												type == "MARKET" &&
												<span>{locale.market.hot_label}</span>
											}
											{
												type == "SPIKE" &&
												<span>{`${locale.market.spikeStatus[item.linkDetail.activityStatus] ? locale.market.spikeStatus[item.linkDetail.activityStatus] : locale.market.spike_label }`}</span>
											}
										</div>
										{
											type == "SPIKE" &&
											<div className="countdown">
											{ 
												Object.keys(item.linkDetail).length > 0 ?
												<CountDown 
													nowtime={item.linkDetail.systemTime * 1000}
													timestart={item.linkDetail.startTime  * 1000}
													timeto={item.linkDetail.endTime * 1000}
													finish={this.onTimerFinish.bind(this, index, item.linkDetail.activityStatus)} /> :
												<CountDown 
													nowtime={0}
													timestart={0}
													timeto={0}
													finish={this.onTimerFinish.bind(this)}
													/>
											}	
											</div>
										}
										
									</div>
									
								</div>	
						})
					}
				</div>
	}
}
