import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import {
	getAppConfig,
	getDefaultAddress, 
	getPayInfo, 
	getCouponList,
	payConfirm,
	paySendsms,
	ordering,
	tradeVerify,
	getShopList,
	getShopInfo
} from '../app_requests';
import AppState from './AppState';
import update from 'immutability-helper';
import {getParam} from '../utils/util';
import wx from 'weixin-js-sdk';
import cookie from 'js-cookie';


useStrict(true);

const VERIFYSTATUS = {
	BINDPHONE: 1 ,
	VERIFY_PAY: 2,
	VERIFY_SMS: 3
};

class Store {

	constructor() {

	}

	@observable defaultAddress = null;
	@observable submitProducts = [];
	@observable totalMoney = 0;
	@observable payInfo = {};
	@observable couponList = [];
	@observable showCouponList = false;
	@observable actualPay = 0;
	@observable selectedCouponItem = [];
	@observable couponDiscount = 0;
	@observable showVerifyModal= false;
	@observable isTradeVerify_pay = false;
	@observable isTradeVerify_sms = false;
	@observable modalStatus = null;
	@observable phoneNumber = "";
	@observable showConfirmModal = false;
	@observable note = "";
	@observable isVirtualProduct = false;    //是否是虚拟商品
	@observable isJDcomProduct = false;    //是否是京东商品
	@observable isVirtualCardProduct = false;  //是否虚拟卡商品
	@observable useIntegralMoney = 0;         //使用的积分
	@observable useStoreMoney = 0;      //使用的储值
	@observable productSaleWay = null;  //商品售卖方式
	@observable note = '';
	@observable orderId = null;
	@observable hasAvailableCoups = 0;   //可使用的优惠券
	@observable verifyErrmsg = null;   //验证错误信息
	@observable curMembershipLevel = null; 
	@observable delivery = 0;   //运费  
	@observable isPaying = false; 
	@observable isUsedStore = false;   //是否使用了储值
	@observable isOpenCustomModule = false;  //是否打开了自定义单选模块
	@observable customModule = null;   //自定义单选模块数据
	@observable canSelfTake = null;   //是否支持自取
	@observable deliveryMethod = null;   //配送方式
	@observable seltDeliveryMethod = null;   //选中的配送方式
	@observable userLocation = null;    //用户的位置
	@observable shopList = []; //  门店列表
	@observable shopListPage = 1;  //列表页数
	@observable hasMorePage = true;   //门店列表是否有更多数据
	@observable showShopList = false;  //是否展示门店列表
	@observable delivery_shop = null;  //同城配送门店
	@observable selfTakeShop = null;  //自提门店
	@observable selfTakeConfig = null;  //字体设置
	@observable selectedTime = null;    //选择的自提时间
	@observable deliveryDitance = null; //配送距离
	@observable selfTakePhone = null; //预留手机号
	@observable send_cityAddress = null; //同城配送地址
	@observable deliveryDistance = null; //配送距离
	@observable isLoading = false;
	@observable timer = null;
	@observable deliveryArea = null; //运费模版数据
	@observable isDeliveryArea = true; //配送范围 
	@observable deliveryFree = null; //是否开启免邮
	@observable totalAmount = "0"; //免邮金
	

	//获取地理位置(经纬度)
	@action getUserLocation(callback) {
		console.log("******getUserLocation******")
		const _this = this;
		wx.ready(function () {
			console.log("**********wx.ready*********")
			wx.getLocation({
				type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
				success: function (res) {
					console.log("res",  res, "*******getLocation*******")
					let latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
					let longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
					runInAction(()=>{
						_this.userLocation = {
							latitude,
							longitude
						};
					});
					_this.getShopList();
				},
				cancel: function (res) {
					_this.getShopList();
					console.log('用户拒绝授权获取地理位置');
				},
				fail: function(err) {
					console.log('授权获取地理位置失败');
					_this.getShopList();
				},
				complete: function(res) {
					console.log(res,"getLocation..complete");
				}
			});
		})
	}


	//可自取门店列表
	@action getShopList() {
		const loc = this.userLocation;
		let page =  this.shopListPage;
		console.log(page,loc, "[submitState.js] page....loc...请求门店列表");
		this.isLoading = true;
		let data = loc ? {page, ...loc} : {page};
		if(!this.hasMorePage) return;
		getShopList(data).then(rst=>{
			runInAction(()=>{
				console.log(rst.list,"[submitState.js] 返回门店列表...")
				let {list, size, totalItems} = rst;
				this.shopListPage = page +1;
				this.isLoading = false;
				this.shopList = page == 1 ? list : this.shopList.concat(list);
				if(!rst.list || (rst.list.length < size) || this.shopList.length >= totalItems) {
					this.hasMorePage = false;
				}
				rst.list[0].selected = true;
				this.shopList[0].selected = true;
				this.selfTakeShop = this.shopList[0];
				console.log(this.shopList.slice(0),"[submitState.js]  this.shopList.....")
			})
		})
	}

	//自取时间
	@action changeSeltTime(time) {
		 this.selectedTime = time;
	}


	//是否显示门店列表
	@action showShopListEvt(bool) {

		if(bool && !this.shopList.length) {
			this.getShopList();
		}
		this.showShopList = bool;
	}

	//门店点击事件
	@action selectShop(seltItem) {
		this.shopList = this.shopList.map(item=>{
			if(item.selected && seltItem.id != item.id) {
				item.selected = false; 
			}else if(item.id == seltItem.id) {
				item.selected = true;
			}

			return item;
		});
	}

	//确定选择门店
	@action confirmSeltShop() {
		const seltShop = this.shopList.filter(item=>item.selected)[0];
		this.selfTakeShop = seltShop;
		this.showShopListEvt(false);
	}

	//门店自取手机号
	@action changePhone(val) {
		this.selfTakePhone = val;
	}

	//切换配送方式
	@action changeDeliveryType(seltItem) {
		this.deliveryMethod = this.deliveryMethod.map(item=>{
			if(item.selected){
				item.selected = false;
			}else if(item.value == seltItem.value){
				item.selected = true;
			}
			return item;
		});

		
		this.seltDeliveryMethod = seltItem;
		
		// if(seltItem.value != 3) { //不是门店自取 
		// 	if(!this.defaultAddress || !this.send_cityAddress) {
		// 		this.changeUserDeliveInfo(seltItem.value);
		// 	} else {
		// 		this.setDefaultAddress(this.defaultAddress);
		// 	}
		// } else {
		// 	this.isDeliveryArea = true;
		// 	this.changeUserDeliveInfo(seltItem.value);
		// }
		if(seltItem.value == 3) {
			this.isDeliveryArea = true;
		}
		this.changeUserDeliveInfo(seltItem.value);
	}

	//改变商品配送信息
	@action changeUserDeliveInfo(deliveType) {
		
		if(deliveType == 1 || deliveType == 2) {
			
			this.getDefaultAddress().then(() =>{
				this.upDateNeedPayCredit();
				this.calcActualPay();
			});
			
		}else if(deliveType == 3 ) {

			this.getUserLocation();
			this.upDateNeedPayCredit();
			this.calcActualPay();
		}
	}


	
	@action setDeliveryMethod(method) {
		this.seltDeliveryMethod = method;
	}


	//保存当前选择的配送方式
	saveSeltDeliveryMethod() {
		const key = "submit_SeltDeliveryMethod";
		const seltDeliveryMethod = this.seltDeliveryMethod;
		localStorage.setItem(key, JSON.stringify(seltDeliveryMethod));
	}



	getSeltDeliveryMethod() {
		const seltDeliveryMethod =  JSON.parse(localStorage.getItem('submit_SeltDeliveryMethod'));
		return seltDeliveryMethod;

	}

	removeSeltDeliveryMethod() {
		const key = "submit_SeltDeliveryMethod";
		localStorage.removeItem(key);
	}
	
	//
	@action selectOption(id, optionIdx) {
		this.customModule = this.customModule.map((item, idx)=>{
			if(item.id == id) {
				item.hasSelected = true;
				item.seltOptionIdx = optionIdx;
			}
			return item;
		})
	}

	@action getMallConfig() {
		return getAppConfig().then(rst => {
			const {isOpenCustomModule, customModule, selfTakeConfig, deliveryArea, deliveryFree, totalAmount} = rst;
			runInAction(()=>{
				this.isOpenCustomModule = isOpenCustomModule;
				this.customModule = customModule;
				this.selfTakeConfig = selfTakeConfig;
				this.deliveryArea = deliveryArea;
				this.deliveryFree = deliveryFree;
				this.totalAmount = totalAmount;
			})
			return rst;
		});
	}


	//获取收货地址
	@action getDefaultAddress() {

		if(this.isVirtualProduct) return;
		const {value} = this.seltDeliveryMethod;
		const _this = this;
		let hasDelivery = false;
		return getDefaultAddress().then(rst => {
			console.log('getDefaultAddress',rst)
			runInAction(() => {
				const {defaultAddress} = rst;
				if(value == 1) {
					if(defaultAddress == null) {
						this.delivery = "0";
						this.isDeliveryArea = false;
					}else {
						this.defaultAddress = defaultAddress;
					}
				}else if(value == 2) {
					if(defaultAddress == null) {
						this.delivery = "0";
						this.isDeliveryArea = false;
					}else {
						this.send_cityAddress = defaultAddress;
						this.getDeliveryShop(defaultAddress);
					}
				}
				console.log(defaultAddress == null,"defaultAddress.....")
				if(value != 3 && defaultAddress != null) { //不是门店自取 获取运费
					this.deliveryArea.map((item, index) => {
						item.area.map((ar, idx) => {
							if(ar.id == defaultAddress.welifeCityId) {
								_this.delivery = item.fee;
								hasDelivery = true;
							}
						})
					})
					if(!hasDelivery) {
						_this.delivery = "0";
						_this.isDeliveryArea = false;
					} else {
						_this.isDeliveryArea = true;
					}
				}
				console.log(_this.isDeliveryArea, "_this.isDeliveryArea....")
				this.calcActualPay();
			});
			return rst;
		})
	}

	//同城配送门店信息
	@action getDeliveryShop() {
		if(this.send_cityAddress) {
			const deliveryDistance = this.deliveryDistance,
				{id} = this.send_cityAddress;
			getShopInfo({id, deliveryRange:deliveryDistance}).then(rst=>{
				runInAction(()=>{
					if(rst && rst.hasOwnProperty('shop')){
						this.delivery_shop= rst;
					}else{
						this.delivery_shop= null;
					}
				})
			});
		}
	}


	@action setDefaultAddress(data) {
	
		this.defaultAddress = data;
		const _this = this;
		let hasDelivery = false;
		this.deliveryArea.map((item, index) => {
			item.area.map((ar, idx) => {
				if(ar.id == data.welifeCityId) {
					_this.delivery = item.fee;
					hasDelivery = true;
				}
			})
		})
		if(!hasDelivery) {
			_this.delivery = "0";
			_this.isDeliveryArea = false;
		} else {
			_this.isDeliveryArea = true;
		}
		return data;
	}

	
	@action setSend_cityAddress(data) {
		this.send_cityAddress = data;
		const _this = this;
		let hasDelivery = false;
		this.deliveryArea.map((item, index) => {
			item.area.map((ar, idx) => {
				if(ar.id == data.welifeCityId) {
					_this.delivery = item.fee;
					hasDelivery = true;
				}
			})
		})
		if(!hasDelivery) {
			_this.delivery = "0";
			_this.isDeliveryArea = false;
		} else {
			_this.isDeliveryArea = true;
		}
		this.getDeliveryShop(data);
		return data;
	}


	@action getCouponList() {
		const money = this.totalMoney,
			{ hasCreditExchange } = this.payInfo;
		
		return getCouponList().then(rst => {
			runInAction(() => {
				this.couponList = rst.list;
			})
			if(this.couponList.length && !hasCreditExchange) {
				this.getAvailableCoupon(money);
			}
			return rst.list;
		})
	}

	//初始化优惠券数据
	@action couponListInit() {
		this.couponList = this.couponList.map(item => {
			item.checked = false;
			return item;
		})
		this.selectedCouponItem.length = 0;
	}

	//
	@action getAvailableCoupon(money) {
		let disabledArr = [], 
			availableArr = [],
			products = this.submitProducts,
			discount = 0,
			giftCouponDisCount = 0,
			seltGiftCouponItem = null,
			_rest = null;
		this.couponList.forEach((item, idx) => {
			if(item.hasOwnProperty('extendId') && item.extendId && item.extendId.length >0 ) {
				let _discount = 0, selectedCoupon = [], hasAvailableExtendId = false;
				products.forEach(ele=>{
					let _arr = item.extendId.filter(i=> i == ele.pid);
					if(!!_arr.length){
						const { levelPrice, unitPrice, unitDiscountPrice, count  } = ele.standard;
						let _price = levelPrice ? 
									levelPrice
									:
									unitDiscountPrice ? unitDiscountPrice : unitPrice;
						if(item.giftCoupon) {
							hasAvailableExtendId = true;
							if(_discount <= _price) {
								_discount = _price;
								item.value = _discount;
								
							}
						}else{
							if( _price * count >= item.min ) {
								_discount = item.value;
								hasAvailableExtendId = true;
							}else{
								hasAvailableExtendId = false;
							}
						}
						giftCouponDisCount = _discount;
					}
				});
				
				if(hasAvailableExtendId) {
					console.log(item,"hasAvailableExtendId")
					selectedCoupon = [item];
					seltGiftCouponItem = selectedCoupon;
					item.available = true;
					item.disabled = false;
					availableArr.push(item);
				} else {
					item.available = false;
					item.disabled = true;
					item.checked = false;
					disabledArr.push(item);
				}
				
			}else {
				if(item.min <= money) {
					const {_discount, selectedCoupon } = this.calcCouponDiscount(item, money);
					item.available = true;
					item.disabled = false;
					availableArr.push(item);
					
					if(_discount >= money) {
						
						let _val = _discount - money;
						
						if(_rest == null) {
							_rest = _val;
							discount = _discount;
							this.selectedCouponItem = selectedCoupon;
						}else if(_val < _rest && _val >= 0) {
							discount = _discount;
							this.selectedCouponItem = selectedCoupon;
						}	
					}else {
						if(discount <= _discount) {
							discount = _discount;
							this.selectedCouponItem = selectedCoupon;
						}
					}
				}else {
					item.available = false;
					item.disabled = true;
					item.checked = false;
					disabledArr.push(item);
				}
			}
		});
		if(seltGiftCouponItem && giftCouponDisCount > discount) {
			this.selectedCouponItem = seltGiftCouponItem;
		}

		this.hasAvailableCoups = availableArr.length ;
		this.couponList = availableArr.concat(disabledArr);
		console.log(availableArr.slice(),disabledArr.slice(),"availableArr,disabledArr" );
		console.log(this.selectedCouponItem,"this.selectedCouponItem.........");
		//设置默认选中最大优惠
		this.selectedCouponItem.length && this.setDefaultSelectedCoup(this.selectedCouponItem);
		this.upDateNeedPayCredit();
		this.calcActualPay();
	}

	
	//选中优惠券
	@action selectCoupon(currentItem) { 
		console.log(this.couponList.slice(), "this.couponList--selectCoupon")
		const totalMoney = this.totalMoney;
		let coupItem = currentItem[0];

		if(coupItem.limitType == 1) {//每满
			
			this.toggleCouponIsChecked_EachFull(coupItem);
			const { selectedCoupon } = this.calcCouponDiscount(coupItem, totalMoney);
			const seltCoupLength = this.selectedCouponItem &&  this.selectedCouponItem.length;
			if(!seltCoupLength) {
				this.setCouponAvailable();
			}else if(seltCoupLength >= selectedCoupon.length) {
				this.setCouponState();
			}

		}else { //满减
			this.toggleCouponIsChecked_Full(coupItem);

			if(this.selectedCouponItem.length) {
				this.setCouponAvailable(coupItem);
			}else {
				this.setCouponAvailable();
			}
		}
		this.PayInfoInit();
		this.upDateNeedPayCredit();
		this.calcActualPay();
		console.log(this.calcActualPay(),"this.calcActualPay().....")
		
	}

	//切换当前券的选中状态--每满
	toggleCouponIsChecked_EachFull(coupItem) {
		this.couponList = this.couponList.map(item=>{
			if(item.limitType != 1) {
				item.available = false;
				item.checked = false;
			}else {
				item.available = true;
				if(item.c2uid == coupItem.c2uid ) {
					if(item.checked){
						item.checked = false;
						this.selectedCouponItem = this.cancelSeltCoupons(coupItem);
					}else {
						item.checked = true;
						this.selectedCouponItem = this.seltCoupon(coupItem);
					}
				}
			}
			return item;
		});
	}

	//切换当前券的选中状态--满减
	toggleCouponIsChecked_Full(coupItem) {
		this.couponList = this.couponList.map(item=>{
			if(item.c2uid == coupItem.c2uid ) {
				if(item.checked) {
					item.checked = false;
					this.selectedCouponItem = this.cancelSeltCoupons(coupItem);
				}else {
					item.checked = true;
					this.selectedCouponItem = [].concat(coupItem);
				}
			}
			return item;
		});
	}

	//计算优惠券可用最大优惠
	calcCouponDiscount(coupItem, totalmoney) {

		let _discount,
			count,
			selectedCoupon= [],
			_money = Number(totalmoney),
			_item_min = Number(coupItem.min),
			_item_money = Number(coupItem.value),
			couponsList = this.couponList;

		if(coupItem.limitType == 1) {
			let commonCoupons = couponsList.filter(item=>item.couponId == coupItem.couponId);
			
			let	_count;
			if(_item_min < _item_money) {

				_count = _money > _item_money ?  Math.floor(_money / _item_money) : 1;
			}else {
				_count = _money > _item_min ? Math.floor(_money / _item_min) : 1;
			}

			count = commonCoupons.length > _count ? _count : commonCoupons.length;
			_discount = count * coupItem.value;
			
			selectedCoupon = commonCoupons.slice(0,count);
		}else {
			_discount = coupItem.value;
			selectedCoupon = [].concat(coupItem);
			count = 1;
		}
		
		
		return {_discount, selectedCoupon};
	}

	//设置券的可选状态(每满)
	setCouponState() {
		this.couponList = this.couponList.map(item => {
			const isHaveCoupon = this.selectedCouponItem.filter(sitem => sitem.c2uid == item.c2uid).length > 0;
			
			if(!isHaveCoupon) {
				item.available = false;
			}
			return item;
		})
		
	}


	//设置默认选中最大优惠的券
	setDefaultSelectedCoup(currentItem) {
		let checkedArr = [], otherArr = [];
		if(currentItem.length > 1) {
			this.couponList = this.couponList.map(item=>{
				for(let i = 0; i <currentItem.length; i++ ) {
					if(currentItem[i].c2uid === item.c2uid) {
						item.checked = true;
						item.available = true;
						break;
					}else {
						item.checked = false;
						item.available = false;
					}  
				}
				return item;
			});
			
		}else if(currentItem.length == 1) {
			console.log(this.couponList.slice(),"this.couponList***")
			const coupItem = currentItem[0];
			this.couponList = this.couponList.map(item=>{
				if(item.available && item.c2uid != coupItem.c2uid) {
					item.available = false;
				}else if(item.c2uid == coupItem.c2uid) {
					item.available = true;
					item.checked = true;
				}
				return item;
			});
		}
		checkedArr = this.couponList.filter(item=>item.checked);
		otherArr = this.couponList.filter(item=>!item.checked);
		this.couponList = checkedArr.concat(otherArr);
	}


	//取消选择券
	cancelSeltCoupons(item) {
		console.log(item,"......item")
		console.log(this.selectedCouponItem,"this.selectedCouponItem555......")
		this.selectedCouponItem = this.selectedCouponItem.filter(coupon=>{
			return coupon.c2uid != item.c2uid
		});
		console.log(this.selectedCouponItem.length,"this.selectedCouponItem;......")
		return this.selectedCouponItem;
	}

	//继续选择券
	seltCoupon(item) {
		this.selectedCouponItem.push(item);
		return this.selectedCouponItem;
	}

	//设置券列表的可用状态
	setCouponAvailable(item) {
		const totalMoney = this.totalMoney;
		const products = this.submitProducts;
		this.couponList = this.couponList.map(coup=>{
			if(!coup.disabled) {
				if(!!item && coup.c2uid != item.c2uid){
					coup.available = false;
				}else{
					if(coup.hasOwnProperty('extendId') && coup.extendId && coup.extendId.length >0 ){
						let hasAvailableExtendId = false;
						products.forEach(ele=>{
							let _arr = coup.extendId.filter(i=> i == ele.pid);
							if(!!_arr.length) {
								hasAvailableExtendId = true;
							}
						});
						if(hasAvailableExtendId) {
							coup.available = true;
						}else {
							coup.available = false;
						}
					}else {
						if(totalMoney >= coup.min) {
							coup.available = true;
						}else {
							coup.available = false;
						}
					}
				}
			}
			return coup;
		});
		return this.couponList;
	}

	@action showCouponListEven(isShow) {
		this.showCouponList = isShow;
	}

	//获取下单商品
	@action getProducts(curMembershipLevel) {
		
		this.submitProducts = this.getSelectedProduct(curMembershipLevel);
		this.totalMoney = this.calTotalMoney(this.submitProducts);
		this.totalCredit = this.calcTotalCredit(this.submitProducts);
		const { isVirtual, isJDcom, saleWay, isVirtualCard, deliveryMethod, deliveryDistance } = this.submitProducts[0];
		if(isVirtual) {
			this.isVirtualProduct = true;
			if(isVirtualCard) {
				this.isVirtualCardProduct = true;
			}
		} else if(isJDcom) {
			this.isJDcomProduct = true;
		} 
		this.productSaleWay = saleWay;
		this.deliveryMethod = deliveryMethod;
		this.deliveryDistance = deliveryDistance ? deliveryDistance : null;
		this.seltDeliveryMethod = deliveryMethod && deliveryMethod.length && deliveryMethod.filter(item=>item.selected)[0];
	}


	//获取支付信息(积分, 储值等)
	@action getPayInfo() {
		const _Pdata = this.submitProducts.slice();
		

		const data = {
			totalMoney: this.totalMoney,
			products: _Pdata
		};
		return getPayInfo(data).then(rst => {
			runInAction(() => {
				const {creditSaving, creditEqUnitMoney } = rst;
				let storedInfo = rst.deduct.length && rst.deduct.filter(el=> el.item == 'stored');
				this.payInfo = rst;
				let ownCreditMoney = Math.floor(creditSaving / creditEqUnitMoney);
				this.payInfo.ownCreditMoney = ownCreditMoney;
				//this.delivery = rst.delivery;
				this.isVerifyTrade();
				this.calcActualPay();
				if(storedInfo.length) {
					this.isUsedStore = storedInfo[0].selected;
				}
			})
			return rst;
		})
	}


	@action PayInfoInit() {
		const { hasCreditExchange, deduct } = this.payInfo;
		let _deduct = deduct.map(el =>{
			if(el.item == 'intergral'){
				if(hasCreditExchange) {
					el.onhand.intergral = 0
				}else {
					el.onhand.amount =  0;
					el.onhand.intergral = 0;
				}
			}
			return el;
		});
		console.log(_deduct,"_deduct...*****")
		this.payInfo = update(this.payInfo, { 
			deduct: {
				$set: _deduct
			}
		});
	}


	//更改商品数量
	@action changeProductItemCount(count, idx) {
		
		//赠品数量操作
		let {gifts,standard}=this.submitProducts[idx];
		 
		if(gifts&&gifts.length){
			gifts.map(o=>{
				o.count=o.count/standard.count*count;
			})
		}
		
		//主商品数量操作
		let _submitProducts = update(this.submitProducts.slice(), {
			[idx] :{
				standard : {
					count: {
						$set: count
					}
				}
			}
		});
		this.submitProducts = _submitProducts;
		this.toGetActualPay();
		// this.PayInfoInit();
		// this.couponListInit();
		// this.totalMoney = this.calTotalMoney(_submitProducts);
		// this.calcTotalCredit(_submitProducts);
		// this.getAvailableCoupon(this.totalMoney);
		// this.upDateNeedPayCredit();
		// this.calcActualPay();
		console.log(this.submitProducts,_submitProducts, "changeProductItemCount.......")
	}

	//得到最终的支付金额
	@action toGetActualPay() {
		let _submitProducts = this.submitProducts;
		this.PayInfoInit();
		this.couponListInit();
		this.totalMoney = this.calTotalMoney(_submitProducts);
		this.calcTotalCredit(_submitProducts);
		this.getAvailableCoupon(this.totalMoney);
		this.upDateNeedPayCredit();
		this.calcActualPay();
		console.log(this.submitProducts,_submitProducts, ".......")
	}


	//选择/取消选择 积分或者储值
	@action changePayInfo(type, value) {
		let {deduct, ...rest} = this.payInfo;
		deduct = deduct.map(el=>{
			if(el.item == type) {
				el.selected = !el.selected;
			}
			if(type == 'stored'){
				this.isUsedStore = el.selected;
			}
			return el;
		});
		runInAction(() => {
			this.payInfo = {deduct, ...rest};
		});
		this.calcActualPay();
		return this.payInfo;
	}

	//减去优惠券抵扣金额后, 积分能够抵扣的金额
	@action calcCreditCanPay() {
		let totalMoney = Number(this.totalMoney), couponDiscount;
		if(this.selectedCouponItem && this.selectedCouponItem.length) {
			couponDiscount = this.selectedCouponItem.reduce((discount, item)=>{
				return discount + item.value;
			},0);
		}else {
			couponDiscount = 0;
		}
		let delivery = this.calcDeliveryFee();
		console.log(delivery,totalMoney, "delivery****totalMoney")
		let needToPayAll = Number(totalMoney) + Number(delivery) - Number(couponDiscount);
		let creditCanPay = Math.floor(needToPayAll);
		this.payInfo.creditCanPay = creditCanPay;
		return {creditCanPay, needToPayAll };
	}

	//计算总共需要的抵扣积分和积分抵扣金额
	@action upDateNeedPayCredit() {
		const _this = this;
		const { hasCreditExchange, deduct, creditEqUnitMoney, creditSaving } = this.payInfo;
		const needTotalCredit = this.totalCredit;
		let {creditCanPay} = this.calcCreditCanPay();
		console.log(this.actualPay,"this.actualPay***")
		console.log(creditCanPay,"creditCanPay***")
		let _deduct = deduct.map(el =>{
			if(el.item == 'intergral'){
				if(hasCreditExchange) {
					el.onhand.intergral = needTotalCredit >= creditSaving ? creditSaving : needTotalCredit
				}else {
					if(this.productSaleWay == 2) {
						let canUseCreditMoney = _this.calcCanUseCreditAmount(this.submitProducts);
						if(!!creditCanPay && creditCanPay >= 1 && canUseCreditMoney > 0) {
							console.log(canUseCreditMoney,"canUseCreditMoney.....")
							el.onhand.amount =  creditCanPay > canUseCreditMoney ? canUseCreditMoney || 1 : creditCanPay;
							el.onhand.intergral = el.onhand.amount * creditEqUnitMoney;
						}else {
							el.onhand.amount =  0;
							el.onhand.intergral = 0;
						}
					}
				}
			}
			return el;
		});
		console.log(_deduct,"_deduct...*****")
		this.payInfo = update(this.payInfo, { 
			deduct: {
				$set: _deduct
			}
		});

		let isOpenCredit = deduct.filter(item=> item.item == 'intergral' && item.selected).length;
		console.log(isOpenCredit,"isOpenCredit....")
		if(isOpenCredit) {
			this.calcActualPay();
		}
		
	}

	//计算运费
	@action calcDeliveryFee() {
		let totalMoney = Number(this.totalMoney);
		const {value} = this.seltDeliveryMethod;
		let hasDelivery = false;
		if(value == 1 ) {
			if( this.defaultAddress != null) {
				this.deliveryArea.map((item, index) => {
					item.area.map((ar, idx) => {
						if(ar.id == this.defaultAddress.welifeCityId) {
							this.delivery = item.fee;
							hasDelivery = true;
							
						}
					})
				})
			}else {
				this.delivery = 0;
				hasDelivery = true;
			}
		} else if(value == 2 ) {
			if(this.send_cityAddress != null) {
				this.deliveryArea.map((item, index) => {
					item.area.map((ar, idx) => {
						if(ar.id == this.send_cityAddress.welifeCityId) {
							this.delivery = item.fee;
							hasDelivery = true;
							console.log(hasDelivery,"hasDelivery.....")
						}
					})
				})
			}else {
				this.delivery = 0;
				hasDelivery = true;
			}
		} else if(value == 3) {
			hasDelivery = true;
		} 
		if(!hasDelivery) {
			this.delivery = 0;
			this.isDeliveryArea = false;
		} else {
			this.isDeliveryArea = true;
		}
		if(this.deliveryFree == 1 && totalMoney >= this.totalAmount) {
			this.delivery = 0;
		} else {
			this.delivery = this.delivery;
		}
		//如果是虚拟商品或者京东，不匹配运费模版
		if(this.isVirtualProduct || this.isJDcomProduct) {
			this.isDeliveryArea = true;
			this.delivery = 0;
		}
		this.delivery = Number(this.delivery);
		console.log(this.delivery,"this.delivery")
		//运费不使用积分抵扣
		let delivery = this.seltDeliveryMethod.value == 3 ? 0 : this.delivery;
		delivery = Number(delivery);
		this.payInfo.delivery = delivery; //重新赋值运费
		return delivery;
	}

	//计算实付款
	@action calcActualPay() {
		let totalMoney = Number(this.totalMoney);
		let totalCredit = this.totalCredit;
		let couponDiscount, deductMoney;
		const { deduct, hasCreditExchange } = this.payInfo;
		
		let storedAmount = 0,    //使用储值金额
			intergralAmount = 0;  //使用积分抵扣金额

		if(hasCreditExchange) {
			let stored = deduct && deduct.length && deduct.filter(( item)=> {
				return item.item == 'stored' && item.selected ;
			})[0]; 
			storedAmount  = stored ?  Number(stored.onhand.amount) : 0;
			deductMoney = storedAmount;
			// couponDiscount = 0;
		}else {
			deduct && deduct.length && deduct.forEach(el => {
				if(el.item == 'stored' && el.selected) {
				   storedAmount = Number(el.onhand.amount);
				}else if(el.item == 'intergral' && el.selected) {
					intergralAmount = Number(el.onhand.amount);
				}
			});
			deductMoney = storedAmount + intergralAmount;
		}

		console.log(storedAmount, intergralAmount,"storedAmount, intergralAmount")

		// let delivery = this.calcDeliveryFee();
		// let totalPay = Number(totalMoney) + Number(delivery) - Number(couponDiscount);
		let {needToPayAll} = this.calcCreditCanPay();
		let totalPay = needToPayAll;
		if(totalPay > 0){
			
			if(hasCreditExchange){   //必须使用积分
				if(totalPay - deductMoney < 0){
					this.useStoreMoney = Number(totalPay.toFixed(2));
					totalPay = 0;
					// this.setTotalPay(totalPay);
				} else {
					this.setDeductDataAvailable();
					this.useStoreMoney = storedAmount;
					totalPay = Number((totalPay - deductMoney).toFixed(2))
					// this.setTotalPay(totalPay);
				} 
			}else {
				//考虑商品金额有小数的情况, 积分抵扣金额不能抵扣小数部分
				let _totalPay = Number(Math.floor(totalPay));
				let fraction = Number(totalPay) - Number(_totalPay.toFixed(2));   //零头
				totalPay = _totalPay == totalPay ? totalPay : _totalPay;
				if(Number(totalPay) + Number(fraction) - Number(deductMoney) < 0) {
					
					if(totalPay - intergralAmount > 0) {
						
						let _needPay = Number((totalPay + fraction - intergralAmount).toFixed(2));
						console.log(_needPay,"_needPay")
						this.useIntegralMoney = Number(intergralAmount);
						if(_needPay - storedAmount > 0) {
							this.useStoreMoney = Number(storedAmount) ;

						}else {
							this.useStoreMoney = Number(_needPay);
							console.log( this.useStoreMoney,"this.useStoreMoney")
							
						}
						totalPay = Number((_needPay - this.useStoreMoney).toFixed(2));
						// this.setTotalPay(totalPay);
					}else {
						this.useIntegralMoney = totalPay;
						if(fraction > 0) {
							if(fraction - storedAmount > 0) {
								this.useStoreMoney = storedAmount.toFixed(2) ;
							}else {
								this.useStoreMoney = fraction.toFixed(2);
							}

							totalPay = +(fraction - this.useStoreMoney).toFixed(2);
							
						}else {
							totalPay = 0;
							this.setDeductDataNoSelected('stored');
						}
						// this.setTotalPay(totalPay);
						
					}
				}else{
					this.setDeductDataAvailable();
					this.useStoreMoney = storedAmount;
					this.useIntegralMoney = intergralAmount;
					totalPay = (totalPay + fraction - deductMoney).toFixed(2);
					// this.setTotalPay(totalPay);
				}
			}
		}else {
			totalPay = 0;
			this.setDeductDataNoSelected();
			// this.setTotalPay(totalPay);
		}
		totalPay = Number(totalPay);
		this.setTotalPay(totalPay);
		return totalPay;

	}
	//计算商品总价格
	calTotalMoney(products) {
		let toMoney = 0;
		toMoney = products.reduce((price, pro2) => {
			const { levelPrice, unitPrice, unitDiscountPrice } = pro2.standard;
			let _price = levelPrice ? 
						levelPrice
						:
						unitDiscountPrice ? unitDiscountPrice : unitPrice;
		
			return price + _price * pro2.standard.count;
		}, 0)
		return Number(toMoney.toFixed(2));
	}

	//计算商品所需积分(saleWay 为 3 或者 4)
	calcTotalCredit(products) {
		let credit = 0;
		credit = products.reduce((credit, pro2) => {
			return credit + pro2.standard.unitCredit * pro2.standard.count;
		}, 0)
		this.totalCredit = credit;
		return credit;
	}

	//计算商品可使用的积分抵扣上限(saleWay 为 2)
	calcCanUseCreditAmount(products) {
		const { creditEqUnitMoney, ownCreditMoney } = this.payInfo;
		let amount = products.reduce((money, pro2) => {
			const { limitUseIntegralAmount , standard} = pro2;
			const { levelPrice, unitPrice , unitDiscountPrice , count} = standard;
			const price = levelPrice ? 
							levelPrice
							:
							unitDiscountPrice ? unitDiscountPrice : unitPrice;
			let productMoney;
			if(pro2.hasOwnProperty('limit_useintegral') && pro2.limit_useintegral != 0) {
				let _productMoney = price * count;
				let limitProductMoney = (limitUseIntegralAmount * count) / creditEqUnitMoney ;
				productMoney = _productMoney <= limitProductMoney ? _productMoney : limitProductMoney;
				console.log(_productMoney,limitProductMoney, productMoney, "has....limitProductMoney")
			}else {
				productMoney = price * count;
				console.log(productMoney , Math.floor(price * count), creditEqUnitMoney, "no....")
			}
			
			return money + productMoney;
		}, 0)
		let delivery = this.calcDeliveryFee();
		let _amount = Math.floor(amount + delivery);
		console.log(delivery, _amount, ownCreditMoney, amount, "delivery, _amount, ownCreditMoney, amount");
		amount = _amount < ownCreditMoney ? _amount : ownCreditMoney;
		this.payInfo.canUseCreditMoney = Math.floor(amount);
		console.log(this.payInfo.canUseCreditMoney, 'lalalalalal.....')
		
		return Math.floor(amount);
	}

	setTotalPay(pay) {
		this.actualPay = pay;
	}

	//设置积分储值的选中和操作状态
	setDeductDataNoSelected(item) {
		let {deduct, hasCreditExchange, ...rst} = this.payInfo;

		if(item) {
			deduct = deduct && deduct.map(el =>{
				if(el.item == item){
					el.selected = false;
					el.disabled= true;
				}
				return el;
			});
		}else {
			deduct = deduct && deduct.map(el =>{
				if(hasCreditExchange && el.item == 'intergral') {
					el.selected = true;
					el.disabled= false;
				}else {
					el.selected = false;
					el.disabled= false;
				}
				return el;
			});
		}
		this.payInfo = {deduct,hasCreditExchange, ...rst};
	}

	//设置支付数据为可选状态
	setDeductDataAvailable() {
		let {deduct, ...rst} = this.payInfo;
		deduct = deduct && deduct.map(el =>{
			el.disabled= false;
			return el;
		});
		this.payInfo = {deduct, ...rst};
	}

	//获取下单商品
	getSelectedProduct(curMembershipLevel) {
		let products = JSON.parse(localStorage.getItem('_frontend_mall-product_submit'));
		
		products = products.map(item => {
			
			let currentStandard = item.standard.filter(std => std.selected)[0];
			if(currentStandard.hasOwnProperty('membershipLevel')) {
				const {membershipLevel} = currentStandard;
				let levelItems = membershipLevel.filter(level=>{
					return level.levelId == curMembershipLevel.levelId
				});
				if(levelItems.length) {
					currentStandard.levelPrice = levelItems[0].levelPrice
				}
			}
			const {name, pic,standard, ...rstData } = item;
			let newItem = {
				name,
				pic,
				standard: currentStandard,
				...rstData
			};
			
			return newItem;
		});
		
		return products;
		
	}

	
	@action showVerifyModalEvt(isShow) {
		this.isPaying = false;
		this.showVerifyModal = isShow;
	} 

	//点击立即支付
	@action submitEvt() {
		//测试
		this.isPaying = true;
		const isUsedStored = this.isUsedStore;
		const { isBindPhone } = this.payInfo;
		if(isUsedStored) {
			this.showVerifyModalEvt(true);
			this.tradeVerifyEvt();
		}else {
			if( isBindPhone ) {
				this.showVerifyModalEvt(true);
				runInAction(()=>{
					this.modalStatus = VERIFYSTATUS.BINDPHONE;   //绑定手机号
				})
			}else {
				this.gotoOrder();
			}
		}
	}

	//是否有交易验证
	isVerifyTrade() {
		if(this.payInfo.hasOwnProperty('tradeVerify')) {
			const { tradeVerify } = this.payInfo;
			const { type, phoneNumber } = tradeVerify;
			let regExp = /^(\d{3})(\d{4})(\d{4})$/;
			if(type == 'sms') {
				this.isTradeVerify_sms = true;
				this.phoneNumber = phoneNumber.length ? phoneNumber.replace(regExp,"$1-$2-$3") : "";
			}else if(type == 'pay') {
				this.isTradeVerify_pay = true;
			}
		}
	}


	@action changeTel(tel) {
		this.phoneNumber = tel;
	}


	//交易验证
	@action tradeVerifyEvt() {

		const { isBindPhone } = this.payInfo;

		if(isBindPhone) {
			
			this.modalStatus = VERIFYSTATUS.BINDPHONE;   //绑定手机号
		}else if(!isBindPhone && this.isTradeVerify_pay){
			
			this.modalStatus = VERIFYSTATUS.VERIFY_PAY;   //储值验证--密码
		}else if(!isBindPhone && this.isTradeVerify_sms) {
			
			this.modalStatus = VERIFYSTATUS.VERIFY_SMS;   //储值验证--短信
		}else if(!isBindPhone && !this.isTradeVerify_pay && !this.isTradeVerify_sms){
			this.showVerifyModalEvt(false);
			
			const  msg = '是否确认使用储值支付进行支付？', 
				okBtn = '确定',
				cancelText = '取消',
				_this = this;
			AppState.showDialog(msg, _this.gotoOrder.bind(this), okBtn,_this.cancelEvt.bind(this), cancelText);
		}
		
	}

	cancelEvt() {
		this.isPaying = false;
	}

	//绑定手机号, 发送验证码
	@action sendCode(tel) {
		const { isBindPhone } = this.payInfo;
		const status  = this.modalStatus;
		let _tel = String(tel).replace(/[^0-9]/ig,"");
		if(status == VERIFYSTATUS.BINDPHONE) {
			paySendsms({
				mobile: _tel,
				smsCodeType: 1
			}).then(rst=>{
				
			});
		}else if(status == VERIFYSTATUS.VERIFY_SMS) {
			let _tel = _tel ? _tel : String(this.phoneNumber).replace(/[^0-9]/ig,"");
			paySendsms({
				mobile: _tel,
				smsCodeType: 2
			}).then(rst=>{
				console.log("send..success")
			});
		}
	}

	//验证弹框点击确定
	@action modalConfirmEvt(code) {
		const status  = this.modalStatus,
			msg = '确定要要使用储值吗?', 
			okBtn = '确定',
			cancelText = '取消',
			_this = this;
		const isUsedStored = this.isUsedStore;
		
		let uphone = String(this.phoneNumber).replace(/[^0-9]/ig,"");
		switch(status) {
			case VERIFYSTATUS.BINDPHONE :
				//提交绑定手机号的验证码  (绑定手机号和交易短信验证 使用同一个接口)smsCodeType: 1: 绑定手机号  2: 使用储值
				return tradeVerify({
					smsCodeType: 1,
					password: "",
					smsCode: code,  //绑定手机号
					uphone
				}).then(rst=>{
					this.bindPhoneCode = code;
					const { status ,errMsg } = rst;
					if(status == 0) {   //支付验证失败
						runInAction(()=>{
							this.verifyErrmsg = errMsg;
						})
						return false;
					}else {

						if(isUsedStored) {
							if(this.isTradeVerify_pay){
								runInAction(()=>{
									this.modalStatus = VERIFYSTATUS.VERIFY_PAY;
								})
								return true;
							}else if(this.isTradeVerify_sms){
								runInAction(()=>{
									this.modalStatus = VERIFYSTATUS.VERIFY_SMS;
								})
								return true;
							}else {
								runInAction(()=>{
									this.showVerifyModalEvt(false);
								});
								AppState.showDialog(msg, _this.gotoOrder.bind(this), okBtn, function() {}, cancelText);
								return true;
							}
						}else {
							
							runInAction(()=>{
								this.showVerifyModalEvt(false);
							});
							this.gotoOrder();
							return true;
						}
					}
				});
				// break;
			case VERIFYSTATUS.VERIFY_PAY :
				this.tradePaycode = code;
				return tradeVerify({
					smsCodeType: 2,
					password: code,   //交易支付密码
					smsCode: '', 
				}).then((rst)=>{
					const { status ,errMsg } = rst;
					if(status == 0) {   //支付验证失败
						runInAction(()=>{
							this.verifyErrmsg = errMsg;
						})

					}else {
						this.gotoOrder();
						this.showVerifyModalEvt(false);
					}
					return false;
				})
				// break;
			case VERIFYSTATUS.VERIFY_SMS :
				this.tradeSmscode = code;
				return tradeVerify({
					smsCodeType: 2,
					smsCode: code,   //交易短信验证码
					password: '', 
					uphone
				}).then((rst)=>{
					const { status ,errMsg } = rst;
					if(status == 0) {   //支付验证失败
						runInAction(()=>{
							this.verifyErrmsg = errMsg;
						})
						return false;
					}else {

						this.gotoOrder();
						this.showVerifyModalEvt(false);
						return true;
					}

				});
				// break;
			default:
				break;
		}
		
	}


	@action cleanErrMsg() {
		this.verifyErrmsg = null;
	}

	getMarketingDid() {
		let did = sessionStorage.getItem('Marketing_did');
		return did;
	}


	//下订单
	@action gotoOrder() {
		this.removeSeltDeliveryMethod();
		let data;
		const customModule = this.customModule && this.customModule.filter(ele=>ele.hasSelected).map(item=>{
			let _item = {
				name: item.name,
				option: item.content[item.seltOptionIdx]
			}
			return _item;
		});

		const did = this.getMarketingDid();
		if(this.isVirtualProduct) {
			data = {
				products: this.submitProducts,
				note: this.note,
				customModule,
				did
			};
		}else {
			const {value} = this.seltDeliveryMethod;
			

			console.log(customModule,"customModule.....")
			console.log(this.delivery, "下订单 运费");
			data = {
				products: this.submitProducts,
				note: this.note,  
				address: value == 1 ? this.defaultAddress : this.send_cityAddress,   //配送地址
				deliveryMethod: value,  //配送方式,
				delivery_shopId: this.delivery_shop ? this.delivery_shop.id : null,   //同城配送门店
				delivery_shopName: this.delivery_shop ? this.delivery_shop.shop : null,
				selfTakeShop: this.selfTakeShop ? this.selfTakeShop :null,   //自取门店
				oTakeTime: this.selectedTime ,//自取时间
				oTakePhone: this.selfTakePhone,//预留手机号
				customModule,
				did,
				delivery: this.delivery
			}
		}
		//商城分销必须传递的参数start
		let marketingAid = getParam('marketingAid'),
			marketingDtid = getParam('marketingDtid'),
			marketingBid = getParam('marketingBid'),
			marketingTid = getParam('marketingTid'),
			marketingDid = getParam('marketingDid');
		let _marketingDid = AppState.getMarketingDid();
		if(marketingAid && marketingAid != "null" && marketingAid != "undefined") {
			data.marketingAid = marketingAid;
		}
		if(marketingDtid && marketingDtid != "null" && marketingDtid != "undefined") {
			data.marketingDtid = marketingDtid;
		}
		if(marketingBid && marketingBid != "null" && marketingBid != "undefined") {
			data.marketingBid = marketingBid;
		}
		if(marketingTid && marketingTid != "null" && marketingTid != "undefined") {
			data.marketingTid = marketingTid;
		}
		if(marketingDid && marketingDid != "null" && marketingDid != "undefined") {
			data.marketingDid = marketingDid;
		}else if(_marketingDid) {
			data.marketingDid = _marketingDid;
		}
		//商城分销必须传递的参数end
		ordering(data).then(rst=>{
			runInAction(()=>{
				this.orderId = rst.orderId;
				this.postPayData();
			})
		}).catch(err=>{
			runInAction(()=>{
				this.isPaying = false;
			});
		});

	}


	//提交支付数据
	@action postPayData() {

		const _this = this;

		let selectCoupon = this.selectedCouponItem && this.selectedCouponItem.length ? this.selectedCouponItem.map(item=>{
			let {giftCoupon, extendId } = item;
			let _item = {
				id : item.c2uid,
				type: !!giftCoupon ? 2 : 1, //1:代金券  2: 礼品券
				giftCouponPay: extendId && extendId.length ? item.value : 0
			}
			return _item;
		}) : [];
		const {hasEntity,deduct, delivery, hasCreditExchange} = this.payInfo;
		const {value} = this.seltDeliveryMethod;

		const data = {
			useStored: this.useStoreMoney,    //使用的储值金额
			useIntegral: this.useIntegralMoney,  //使用的积分抵扣的金额
			totalMoney: this.totalMoney,   //商品总金额
			orderId: this.orderId,        //订单Id   
			needToPay: this.actualPay,    //实际所需支付金额
			selectCoupon,    //选择的优惠券c2uid(array)
			deliveryMethod: value,   //配送方式
			delivery: value == 3 ? 0 : delivery, //快递费
			hasEntity ,    //是否有实物商品
			creditExchange: this.totalCredit,   //商品使用的积分
			hasCreditExchange,  //是否必须使用积分
			deduct,    //支付信息

		}
		wx.miniProgram.getEnv(function(res) { 
			const isInMiniprogram = res.miniprogram ? 2 : 1;    //当前环境: 小程序:2, JSAPI: 1
			const whereFrom = cookie.get('whereFrom');
			const comeOpenId = cookie.get('comeOpenId');
			data.payScene = isInMiniprogram;
			data.whereFrom = whereFrom;
			//data.comeOpenId = comeOpenId;
			console.log(data,"postPayData...")
			payConfirm(data).then(rst=>{
				const { payParams, needWePay } = rst;
				console.log(payParams,"payParams...")
				const { orderId, appId } = payParams;
				if(!!needWePay) {
					const payData = payParams;
					_this.gotoPay(isInMiniprogram, payData);

				}else{
					const payResult = 1;
					location.replace(`/v2/payResult?payResult=${payResult}&orderId=${orderId}&appId=${appId}`); 
				}
				
			}).catch(err=>{
				console.log(err, "payconfirm-fail...")
				const payResult = 0,
					orderId = _this.orderId;
				location.replace(`/v2/payResult?payResult=${payResult}&orderId=${orderId}`); 
			});
		});
	}

	@action setNote(note) {
		this.note = note;
	}

	//去支付
	gotoPay(isInMiniprogram, payData) {
		console.log(payData,"gotoPay...");
		this.removeSeltDeliveryMethod();
		if(isInMiniprogram == 2) {
			let _payData = encodeURIComponent(JSON.stringify(payData));
			let url = `/pages/h5MallPay/h5MallPay?payData=${_payData}`;
			wx.miniProgram.navigateTo({url});
		}else if(isInMiniprogram == 1) {
			this.wxPay(payData);
		}
	}

	//微信支付
	wxPay(payData){

		console.log(payData, "wxPay....payParams");

		const { payFrom, partPay,orderId } = payData;

		window.WeixinJSBridge.invoke(
			'getBrandWCPayRequest',
			{...payData},
			function(res){

			 if (res.err_msg == 'get_brand_wcpay_request:ok') {
				 console.log('success_pay_wx : 支付成功--success ', res );
				 location.replace(`/v2/payresult?payResult=1&&orderId=${orderId}&payFrom=${payFrom}&partPay=${partPay}`) ;
 
			 } else if (res.err_msg == 'get_brand_wcpay_request:cancel') {
				 
				 console.log('cancel_pay_wx : 支付失败--cancel', res );
				 location.replace(`/v2/payresult?payResult=0&&orderId=${orderId}&payFrom=${payFrom}&partPay=${partPay}`);
				 
			 } else {
				 console.log('fail_pay_wx : 支付失败--fail',res );
				 location.replace(`/v2/payresult?payResult=0&&orderId=${orderId}&payFrom=${payFrom}&partPay=${partPay}`);
			 }
		 }); 
	 }

}

const SubmitStore = new Store();

export default SubmitStore;