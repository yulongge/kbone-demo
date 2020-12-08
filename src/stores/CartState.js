import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import { getAppConfig, getCartList, cartUpdate, getMallConfigData } from '../app_requests';
import {asArray, isComeFromDistribution, formatDisbUrl} from '../utils/util';
import wx from '../utils/wx';

useStrict(true);

class Store {

	constructor() {

	}

	@observable cartData = null;
	@observable isLoading = true;

	@action getCartList() {
		return getAppConfig().then((config) => {
			if(!config) return;
			if(isComeFromDistribution()) {
				wx.authorize({...config.authorize, redirectUrl: formatDisbUrl()});
				return;
			}
			return getMallConfigData().then(mallCOnfig => {
				return getCartList().then(rst => {
					rst.cartList = rst.cartList.map(item=>{
						item.standard[0].selected = true;
						
						
						/******begin**把gifts里面conut 乘以 商品count得到赠品应送数量*****/
						let{gifts,standard}=item;
						const{count}=standard[0];
						if(gifts&& gifts.length){
							gifts.map(o=>o.count=o.count*count)
						}
						/******edn********/
						return item;
					});
					console.log(rst, mallCOnfig, 'cartList')
					rst.nav.data = rst.nav.data.map((item, index) => {
						if(index == 0) {
							item.icon = mallCOnfig.components.nav.data[0].icon;
						}
						return item;
					})
					runInAction(() => {
						this.isLoading = false;
						this.cartData = { 
							...rst,
							...config
						};
					})
					return rst;
				})
			})
			
		})
	}

	@action cartUpdate(data) {
		return cartUpdate(data).then(rst => {
			runInAction(() => {
				this.cartData.cartListNum = rst.cartListNum;
			})
			return rst;
		})
	}

	@action updateCartData(data) {
		this.cartData = data;
		console.log("setProductChecked", this.cartData)
	}

	@action clearCartData() {
		this.cartData = null;
	}

	//计算商品所需的积分(仅针对积分换购和积分+购买的商品, saleWay为3或者4)
	calcNeedAllCredit(products) {
		console.log(products,"products....")
		let totalCredit = products.reduce((credit, pro2) => {
			let { unitCredit, count } = pro2.standard[0];
			return credit +  unitCredit * count;
		},0)
		return totalCredit;
	}


	// @action submitProducts(data) {
	// 	return submitProducts(data).then(rst => {
	// 		return rst;
	// 	})
	// }

}

const CartState = new Store();
export default CartState;