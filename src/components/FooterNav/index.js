import React, {Component} from 'react';
import {getQrcode, getParam, getParams} from '../../utils/util';
import CompleteInfoModal from "Components/CompleteInfoModal";
import styles from './style.less';
import locale from './footerNav.locale';

export default class FooterNav extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isIphoneX: this.isIphonex(),
			showPerfect: false, //显示引导完善资料图
			showPerfect: false,
			curUrl: "",
			curType: "",
			curName: ""
		}
	}
	componentWillMount() {
		console.log('componentWillMount.....FooterNav');
	}
	//是否需要完善信息
	isPerfectInfor(url, type, name) {
		console.log(this.props, url, 'this props');
		const {detailData} = this.props;
		if(type == 2) {
			if((detailData.perfectType == 1 || detailData.perfectType == 2) && detailData.isPerfectInfor == 0) {
				this.setState({
					showPerfect: true,
					curUrl: url,
					curType: type,
					curName: name
				});
			} else {
				this.toPage(url, type, name);
			}
		} else {
			this.toPage(url, type, name);
		}
	}
	

	//关闭引导完善资料弹框
	toClosePerfect() {
		const {curUrl, curType, curName} = this.state;
		const {detailData} = this.props;
		if(detailData.perfectType == 1 && detailData.isPerfectInfor == 0) {
			this.setState({
				showPerfect: false
			});
			return;
		} else if(detailData.perfectType == 2 && detailData.isPerfectInfor == 0) {
			this.toPage(curUrl, curType, curName);
			this.setState({
				showPerfect: false
			});
		}
		
	}
	toPage(url, type, name) {

		console.log(url, type, name,"url, type, name.....")
		const {detailData} = this.props;
		const { isNewMall } = this.props;
		console.log(isNewMall, url, 'isNewMall');
		let ptype = null, incomePredict = null;
		let distributionProduct = false, 
			distributionEnabled = false, 
			distributionMinEarn = 0, 
			distributionMaxEarn=0, 
			isDistributor = false,
			uid = null;
		if(detailData) {
			distributionProduct = detailData.distributionProduct;
			distributionEnabled = detailData.distributionEnabled;
			distributionMinEarn = detailData.distributionMinEarn;
			distributionMaxEarn = detailData.distributionMaxEarn;
			isDistributor = detailData.isDistributor;
			uid = detailData.uid;
		}
		const paramUid = getParam('uid');
		console.log(paramUid, paramUid && paramUid != "null" && paramUid != 'undefined', 'paramUid');
		if(paramUid && paramUid != "null" && paramUid != 'undefined') {
			uid = paramUid;
		}
		console.log(uid, 'uid');
		if(type == 0) return;
		if(type == 2) {
			if(name == "pluscard") {
				console.log("pluscard");
				this.props.plusCart();
				return;
			}
			if(name == "gobuy") {
				console.log("gobuy");
				this.props.goBuy();
				return;
			}
			return;
		}
		if(this.props.from == "groupon") {
			const {aid} = this.props;
			let mallDomain = "https://mall.acewill.net",
				h5Domain = "https://h5.acewill.net";
			const currentUrl = window.location.href;
			if(currentUrl.indexOf(".dev.") > 0) {
				let isHaveLilong = currentUrl.indexOf("lilong") > 0;
				h5Domain = `http://h5.dev.acewill.net`;
				mallDomain = `http://${isHaveLilong ? 'lilong.' : ''}mall.dev.acewill.net`
			} else if(currentUrl.indexOf(".beta.") > 0) {
				h5Domain = "http://h5.beta.acewill.net";
				mallDomain = "http://mall.beta.acewill.net"
			} else if(currentUrl.indexOf(".pre.") > 0) {
				h5Domain = "http://h5.pre.acewill.net";
				mallDomain = "http://mall.pre.acewill.net"
			} else {
				h5Domain = "https://h5.acewill.net";
				mallDomain = "https://mall.acewill.net"
			}
			
			let toUrl = `${mallDomain}${url}?qrcode=${getQrcode()}&fqrcode=${getQrcode()}&comeFrom=groupon&aid=${aid}`
			if(name == "mycoupon") {
				toUrl = `${h5Domain}${url}?qrcode=${getQrcode()}&fqrcode=${getQrcode()}&comeFrom=groupon&aid=${aid}`;
			}

			if(name == "index") {
				location.reload();
			} else {
				location.href = toUrl;
			}
			return;
		}
		console.log(url,!!this.props.isNewMall,"url...gotoCart")

		if(url.indexOf('cart') >= 0 && !!isNewMall ){
			let _url = `/v2/cart?uid=${uid}`;
			this.gotoCart(_url);
			
		}else {
			console.log(uid, "footerNav")
			location.href = `${url}?qrcode=${getQrcode()}&comeFrom=mall&uid=${uid}`;
		}

	}

	gotoCart(url) {
		this.props.history.push(url);
	}

	isIphonex() {
		if (typeof window !== 'undefined' && window) {
			return /iphone/gi.test(window.navigator.userAgent) && window.screen.height >= 812;
		}
		return false;
	}

	render() {
		const { data, cartCount, from, detailData} = this.props,
			{ isIphoneX, showPerfect } = this.state;
		const {isVirtualCard, isGradeCard, isVirtual, saleWay} = !!detailData && detailData;
		let arrData = this.props.data.data;
		let willHide = ((isVirtualCard || isGradeCard || isVirtual ) || (saleWay == 3 || saleWay == 4 )) ? true : false;
		console.log(this.props, 'props');

		if(willHide && from == 'detail' ) {
			arrData = arrData.filter(ele=>{
				if(ele.name == 'gobuy' && willHide ) {
					if(saleWay == 3 || saleWay == 4) {
						ele.text = locale.toExchange;
					}
				}
				return ele;
			})
		}
		let {style} = data;
		if(!style) style = {};
		console.log(arrData,"arrData.....")
		return 	<div className={`${styles.footerNav} footerNav ${isIphoneX ? 'iphonex' : ''}`} onClick={this.props.clickFun}>
					<div 
						className={this.props.activeComp ? `navlist ${from == 'detail' ? 'detailnav' : ''} active` : `navlist ${from == 'detail' ? 'detailnav' : ''}`}
						style={{
							backgroundColor: from == 'detail' ? '#fff' : style.bgColor,
							//color: style.fontColor
						}}>
						{
							arrData.map((item, index)=> (	
								
								<div 
									onClick={this.isPerfectInfor.bind(this, item.url, item.type, item.name)}
									className={`nav_item ${item.type == 0 ? 'logo' : 'icon'} ${item.type == 2 ?' noflex':'' }`} 
									key={index}>
									<div className={`${item.type == 2 ?  `${item.name} text` : ""} ${item.name == 'gobuy' &&willHide ? 'lgBtn' : ''}`} >
										{
											item.icon && item.icon.length &&
											<div className="icon_con">
												<img src={item.icon} />
												{/* {
													!!((index == 2 && cartCount && from != "detail") || (from == "detail" && index == 2 && cartCount)) &&
													<i className="count">{cartCount}</i>
												} */}
												{
													!!(item.hasOwnProperty('name') && item.name == 'cart' && cartCount) &&
													<i className="count">{cartCount}</i>
												}
											</div>
										}
										
										
										{
											item.type == 1 ?
											<span 
												style={{
													color: index == 1 || from == 'detail' || from == 'cart' ? '' : style && style.fontColor,
													color: item.current && item.fontColor
												}}
												className={`${(from == 'groupon' && index == 0) || (from != 'groupon' && from != 'order' && index == 1 && from != 'cart') ? 'first_icon' : ''}`}>
													{item.text}
													{
														item.hasOwnProperty('phone') && <a className="tel" href={`tel:${item.phone}`}></a>
													}
											</span> : null
										}

										{item.type == 2 && item.text}										
									</div>
								</div>
							))
						}	
					</div>
					{
						showPerfect && 
						<CompleteInfoModal
						data={detailData}
						onCloseModal={this.toClosePerfect.bind(this)}/>
					}	
				</div>
	}


}