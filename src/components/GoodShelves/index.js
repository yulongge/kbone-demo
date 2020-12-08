import React, {Component} from 'react';
import { observer, inject } from 'mobx-react';
import locale from "./locale";
import ShelveItem from "./ShelveItem";
import Standard from "Components/common/Standard";
import CompleteInfoModal from "Components/CompleteInfoModal";
import {Toast} from 'react-weui';
import {getQrcode, getParam} from '../../utils/util';
import styles from './style.less';

@inject('store')
@observer
export default class GoodShelves extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showCart: false,
			showMember: false,
			curStandard: "",
			curStandardIdx: 0,
			curMembershipLevel: props.curMembershipLevel
		}
	}


	componentWillReceiveProps(newProps) {
		if(newProps.curMembershipLevel != this.props.curMembershipLevel) {
			this.setState({
				curMembershipLevel: newProps.curMembershipLevel
			})
		}
	}

	_addToCartEvent(data,e) {
		e.stopPropagation();
		
		this.setState({
			currentGoodItem:data
		}, ()=>{
			this.isPerfectInfor(data);
		});
		console.log(data,"data.....")
		
		
	}


	//是否需要完善信息
	isPerfectInfor(data) {
		const {perfectType, isPerfectInfor } = data;
		console.log(perfectType, isPerfectInfor,"perfectType, isPerfectInfor....")
		if((perfectType == 1 || perfectType == 2) && isPerfectInfor == 0) {
			this.setState({
				showPerfect: true,
			});
		} else {
			this._plusCart(data);
		}
	}

	_plusCart(data ) { //加入购购物(判断有无多种规格)
		if(!this._isCanBuy(data)) return;
		const {standard } = data;
		console.log(data,".......plus...")
		if(standard.length > 1) {
			this.setState({
				showCart: true,
				currentStandard: standard[0]
			})
			return;
		}
		if(standard.length == 1) {
			let curStandard = standard[0];
			this._confirmShopCard(curStandard, 1);
			return;
		}

		this.props.store.AppState.showWarn(locale.errorMsg.standard);
	}

	_isCanBuy(data) {
		const {isCanBuy, type, productGradeName} = data;
		if(type == "GRADE") {
			if(isCanBuy !=1) {
				let errTip = locale.errorMsg.buyTipNo;
				if(isCanBuy == 2) {
					errTip = `${locale.errorMsg.buyTip}${productGradeName}${locale.errorMsg.noBuy}`;
				}
				this.props.store.AppState.showWarn(errTip);
				return false;
			}
		}
		return true;
	}

	_confirmShopCard(curStandard, shopCount) { //确定购买
		console.log(curStandard, shopCount,"curStandard, shopCount...")
		const {isRightBuy, currentGoodItem } = this.state;
		this.props.store.ProductState.getProductDetailData({id: currentGoodItem.pid}).then(rst=>{
			console.log("goodDetail",rst)
			let {gifts}=rst;
			if(gifts&&gifts.length){
				gifts=gifts.filter(o=>!!o.checked)
			}
			//const _this = this;
			
			let pCount = [],shopStandard = {};
			shopStandard = {
				id: currentGoodItem.id,
				count: shopCount,
				selected: true,
				standardID: curStandard.standardID,
				gifts,
			};
			pCount.push(shopStandard);
			
			this.props.store.ProductState.plusCart(pCount).then(rst => {
				this.setState({
					showToast: true
				})
				let num = rst.cartListNum;
				this.props.store.MallState.updateCartCount(num);

				setTimeout(() => {
					this.setState({
						showToast: false
					})
				}, 3000)
				
			});
			
			this._closeStandard();
		})
	}

	overOhandToast() {
		const { AppState } = this.props.store;
		AppState.showWarn(locale.errorMsg.overOnhand);
	}

	_closeStandard() {
		this.setState({
			showCart: false
		})
	}

	_showMemberPrice(curStandard ) {
		const {curMembershipLevel} = this.state;
		console.log(curMembershipLevel,"curMembershipLevel.....")
		if(!curStandard.membershipLevel) {
			this.setState({
				showMember: false
			})
			return false;
		}
		const levelPrices = curStandard.membershipLevel.filter(item => item.levelId == curMembershipLevel.levelId);
		console.log(levelPrices, 'levelPrices')
		if(levelPrices.length) {
			this.setState({
				showMember: true
			})
		} else {
			this.setState({
				showMember: false
			})
		}
	}

	_getMemberPrice(curStandard) {
		const {curMembershipLevel} = this.state;
		let {symbol} = this.props.store.AppState.config ? this.props.store.AppState.config : "";
		if(!symbol)
			symbol = "￥";
		if(!curStandard) return;
		let priceStr = "";
		let {unitPrice, unitCredit,  unitDiscountPrice } = curStandard;
		let _levelPrice;
		const {membershipLevel} = curStandard;
		membershipLevel && membershipLevel.forEach(level => {
			if(level.levelId == curMembershipLevel.levelId) {
				_levelPrice = level.levelPrice;
			}
		});
		
		unitPrice =	_levelPrice ? 
						_levelPrice
						:
						unitDiscountPrice ? unitDiscountPrice : unitPrice;

		priceStr = `${unitPrice > 0 ? symbol +  unitPrice : ''} ${unitPrice && unitCredit ? '+' : ''} ${unitCredit > 0 ? unitCredit + '<label>积分<label>' : ''}`
		
		return priceStr;
	}

	setCurrentStandard(data, idx) {
		this.setState({
			curStandard: data,
			curStandardIdx: idx
		})
	}
	_goDetail(pid) {
		location.assign(`/v2/product/detail/${pid}?qrcode=${getQrcode()}&uid=${getParam('uid')}`);
	}
	
	_imgOnError(e) {
		console.log(e, 'errormsg')
	}

	_onCloseModal() {
		const {currentGoodItem} = this.state;
		if(currentGoodItem.perfectType == 1 && currentGoodItem.isPerfectInfor == 0) {
			this.setState({
				showPerfect: false
			});
			return;
		} else if(currentGoodItem.perfectType == 2 && currentGoodItem.isPerfectInfor == 0) {
			this._plusCart(currentGoodItem);
			this.setState({
				showPerfect: false
			});
		}
	}
	
	

	render() {
		const {showCart, showMember , currentGoodItem, curMembershipLevel, curStandardIdx, curStandard, showPerfect } = this.state;
		let {symbol} = this.props.store.AppState.config ? this.props.store.AppState.config : "";
		if(!symbol)
			symbol = "￥";
		const {data , style } = this.props;
		let newStyle = {};
		if(style && style.mode) {
			newStyle = {
				borderRadius: "10px"
			}
		}

		return 	<div className="init_goodshelves">
					<div className="init_goods">
					{
							data.length ?
							data.map((item, index) => {
								return <ShelveItem
											key={index}
											data={item}
											newStyle={newStyle}
											_goDetail={this._goDetail.bind(this)}
											addToCart={this._addToCartEvent.bind(this)}
											_imgOnError={this._imgOnError.bind(this)}
											history={this.props.history}
										/>
							}) : null 
						}
					</div>
					
					<Toast icon="success-no-circle" show={this.state.showToast}>{locale.success}</Toast>
					{	
						showCart &&
						<Standard 
							data={currentGoodItem}
							showMember={showMember}
							symbol={symbol}
							currentStandard={curStandard}
							activeIdx={curStandardIdx}
							curMembershipLevel={curMembershipLevel}
							setCurrentStandard={this.setCurrentStandard.bind(this)}
							showMemberPrice = {this._showMemberPrice.bind(this)}
							_getMemberPrice={this._getMemberPrice.bind(this)}
							_confirmShopCard={this._confirmShopCard.bind(this)}
							overOhandToast={this.overOhandToast.bind(this)}
							closeStandard={this._closeStandard.bind(this)} />
					}

					{
						showPerfect &&
						<CompleteInfoModal
						data={currentGoodItem}
						onCloseModal={this._onCloseModal.bind(this)}/>
					}
                </div>
	}
}