import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import {getMallConfigData, getAppConfig} from '../app_requests';
import wx from 'weixin-js-sdk';
import update from 'immutability-helper';
import {isComeFromDistribution, formatDisbUrl} from '../utils/util';
import wxEvt from '../utils/wx';

useStrict(true);

class Store {
	constructor() {

	}

	@observable mallData = {};
	@observable mid = null;
	@observable allData = {};
	@observable isInMiniprogram = false;
	@observable mallDataComponent = null;

	@action getCurEnv() {
		const _this = this;
		wx.miniProgram.getEnv(function(res) { 
			console.log(res, "wx.miniProgram.getEnv")
			runInAction(()=>{
				_this.isInMiniprogram = res.miniprogram ? 1 : 0; 
			});
		});
	}
    
	@action getMallConfig() {
		return getAppConfig().then((config) => {
			console.log(config, 'zenmkenegn');
			if(!config) return;
			if(isComeFromDistribution()) {
				wxEvt.authorize({...config.authorize, redirectUrl: formatDisbUrl()});
				return;
			}
			return getMallConfigData().then(rst => {
				runInAction(() => {
					this.mallData = rst;
					let spikeData = this.mallData.components.spike.data.map(item => {
						if(Date.now() / 1000 >= item.linkDetail.endTime) {
							item.linkDetail.status = "EMPIRE"
						}
						item.type = "spike";
						return item;
					})
					this.mallData.components.spike.data = spikeData;
					let menuData =  this.mallData.components.menu.data.map(item => {
						if(!item.linkDetail) {
							item.type = "";
						} else if(typeof item.linkDetail == "string") {
							item.type = "link";
						} else if(item.linkDetail.cid) {
							item.type = "category";
						} else if(item.linkDetail.id && !item.linkDetail.cid) {
							item.type = "product";
						} else {
							item.type = "";
						}
						return item;
					})
	
					let marketData =  this.mallData.components.market.data.map(item => {
						if(!item.linkDetail) {
							item.type = "";
						} else if(item.linkDetail.name && !item.linkDetail.id) {
							item.type = "link";
						} else if(item.linkDetail.cid) {
							item.type = "category";
						} else if(item.linkDetail.id && !item.linkDetail.cid) {
							item.type = "product";
						} else {
							item.type = "";
						}
						return item;
					})
	
					let navData =  this.mallData.components.nav.data.map((item, index) => {
						if(item.type == 0 || index == 1) {
							item.url = "/index"
						}
						if(index == 2) {
							item.url = "/mall/product/cart";
						}
	
						if(index == 3) {
							// item.icon = "https://welifestatic.oss-cn-beijing.aliyuncs.com/images/manage/2018/mall/decorate/index/my.png";
							item.text = '我的';
							item.url = '/v2/mine';
						}
						return item;
					})
					this.mallData.components.spike.data = spikeData;
					this.mallData.components.market.data = marketData;
					this.mallData.components.menu.data = menuData;
					this.mallData.components.nav.data = navData;
					this.getMallDataComponent();
					this.allData = {...rst, ...config};
				});

				return {...rst, ...config};
			});
		})
		
	}

	@action getMallDataComponent() {
		let _mallData = this.mallData.components;
		this.mallDataComponent = !!_mallData && Object.keys(_mallData).map((item, idx)=>{
			let _item;
			if(_mallData[item]) {
				
				if( _mallData[item] && _mallData[item].hasOwnProperty('sort')){
					_item = {
						type: item,
						..._mallData[item]
					};
	
				}else {
					let comp = this.mallData.components[item];
					console.log(comp,typeof comp,"comp&&&&&&")
					if(typeof comp != "object"){
						_item = {
							type: item,
							sort: 0,
							comp
						};
					}else{
						this.mallData.components[item].sort = 0;
						_item = {
							type: item,
							sort: 0,
							..._mallData[item]
						};
					}
					
				}
				console.log(_item,"_item.....")
				return _item;
			}
		}).sort((a,b)=>{
			return a.sort - b.sort;
		}).filter(el=> el && Object.keys(el).length);

		console.log(this.mallDataComponent.slice(),"this.mallDataComponent.......")
	}

	@action updateCartCount(num) {
		this.mallData = update(this.mallData,{
			components: {
				cartCount: {
					$set: num
				}
			}
		})
	}

	
	saveOpenId(value) {
		const key = "_frontend_mall-openId";
		localStorage.setItem(key, JSON.stringify(value));
	}

	
}


const MallState = new Store();

autorun(() => {

})
export default MallState;