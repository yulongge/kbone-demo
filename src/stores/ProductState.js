import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import {getProductDetail, plusShopCard, getAppConfig } from '../app_requests';
import update from "immutability-helper";
import {asArray, isComeFromDistribution, formatDisbUrl} from '../utils/util';
import wx from '../utils/wx';
import AppState from './AppState';

useStrict(true);

class Store {

	constructor() {

	}

	@observable detailData = null;
	@observable creditCanBuy = true;
	@observable selectedProducts = null;

	@action getProductDetailData(data) {
		return getAppConfig().then((config) => {
			if(!config) return;
			if(isComeFromDistribution()) {
				wx.authorize({...config.authorize, redirectUrl: formatDisbUrl()});
				return;
			}
			
			return getProductDetail(data).then(rst => {
				runInAction(() => {
					this.detailData = {...rst, ...config};
					this.setStorage('userLevel', rst.curMembershipLevel)
				});
				return {...rst, ...config};
			})
		});
		
	}

	@action plusCart(product) { //加入购物车
		return plusShopCard({pCount: product}).then(rst => {
			return rst;
		})
	}

	//计算商品所需的积分(仅针对积分换购和积分+购买的商品, saleWay为3或者4)
	calcNeedAllCredit() {
		const { creditSaving } = this.selectedProducts;
		let curStandard = this.selectedProducts.standard.filter(std => std.selected)[0];
		const { unitCredit, count } = curStandard;
		let totalCredit = unitCredit * count;
		return totalCredit;
	}

	@action setSelectedProduct(product, curStandard, pCount) {
		console.log(product,"pCount--productStore");
		const {count,gifts} = pCount[0],
			index = this.getStandardIndex(product.standard, curStandard);

		console.log(curStandard,"curStandard....")
		const { curMembershipLevel } = product;
		const {membershipLevel} = curStandard;
		// let 
		let _levelPrice = '';
		membershipLevel && membershipLevel.forEach(level => {
			if(level.levelId == curMembershipLevel.levelId) {
				_levelPrice = level.levelPrice;
			}
		});

		let newStandard = update(product.standard.slice(), {
			[index]: {
				count: {
					$set: count
				},
				selected: {
					$set: true
				}
			}
		})

		if(_levelPrice) {
			newStandard = update(newStandard, {
				[index]: {
					levelPrice: {
						$set: _levelPrice
					}
				}
			});
		}
		console.log(newStandard,"newStandard")
		let buyProduct = update(product, {
			standard: {
				$set: newStandard
			},
			gifts:{
				$set:gifts
			}
		});

		this.selectedProducts = buyProduct;
		return buyProduct;
	}


	// @action goBuy(product, curStandard, pCount) { //立即购买
	// 	console.log(product,"pCount--productStore");
	// 	console.log(this,"this......")
	// 	const counts = pCount[0].count,
	// 		index = this.getStandardIndex(product.standard, curStandard),
	// 		saleWay= product.saleWay,
	// 		creditSaving = product.creditSaving;

	// 	let newStandard = update(product.standard.slice(), {
	// 		[index]: {
	// 			count: {
	// 				$set: counts
	// 			},
	// 			selected: {
	// 				$set: true
	// 			}
	// 		}
	// 	})
	// 	let buyProduct = update(product, {
	// 		standard: {
	// 			$set: newStandard
	// 		}
	// 	});

	// 	//判断当前商品的售卖方式: 3: 积分换购   4: 积分+购买  此两种情况需要判断用户的积分余额能不能购买商品 
	// 	if(saleWay == 3 || saleWay == 4) {
	// 		console.log(saleWay,"saleway....")
	// 		const needCredit = this.calcNeedAllCredit(buyProduct);
	// 		console.log(needCredit, creditSaving,"needCredit....creditSaving")
	// 		if(needCredit > creditSaving ){
	// 			this.creditCanBuy = false; 
	// 			const msg = '积分不足',
	// 				type = 'warn',
	// 				timeout = 3000;
	// 			AppState.showWarn(msg, type, timeout);
	// 		}else {
	// 			this.updateSelectedProduct(buyProduct);
	// 			callback();
	// 		}
	// 	}else {
	// 		this.updateSelectedProduct(buyProduct);
	// 		callback();
	// 	}
		

	// }



	@action resetProduct() {
		this.detailData = null;
	}


	getStandardIndex(standards, curStandard) {
		let curIndex = 0;
		standards.forEach((item, index) => {
			if(item.standardID == curStandard.standardID) {
				curIndex = index;
			}
		})
		return curIndex;
	}

	updateSelectedProduct() {
		let buyProduct = this.selectedProducts;
		console.log(buyProduct, 'buyProduct')
		let newProd = asArray(buyProduct);
		this.setStorage(`product_spiked`, newProd);
		//newProd.push(buyProduct)
		this.setStorage(`product_submit`, newProd);
		
		
	}
	
	@action updateDetailData(data) {
		this.detailData = data;
	}

	setStorage(key, value) {
		const prefix = "_frontend_mall-";
		localStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
	}

	
}

const ProductState = new Store();

export default ProductState;