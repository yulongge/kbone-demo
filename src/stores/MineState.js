import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import {
	getAppConfig,
	getMineData,
	doApply,
	doSendVCode,
	isApply,
	getPerfectInfo,
	savePerfectInfo,
	sendPerfectMsg,
	getMallConfigData
} from '../app_requests';
import {isComeFromDistribution, formatDisbUrl} from '../utils/util';
import wx from '../utils/wx';

useStrict(true);

class Store {

	constructor() {

	}

	@observable mineData = null;
	@observable applyData = {};
	@observable isCanBeDistributor = false;
	@observable perfectData = null;
	@observable perfectDataLength = 0;

	@action getPerfectInfo() {
		return getPerfectInfo().then(rst => {
			runInAction(() => {
				this.perfectData = rst;
				let activeNameArray = [];
				Object.keys(rst).forEach(function(key){
					console.log(key,rst[key]);
					if(key == "custom") {
						for(let i = 0; i < rst[key].length; i++ ) {
							activeNameArray.push("custom" + i);
						}
					} else {
						activeNameArray.push(key);
					}
				});
				this.perfectDataLength = activeNameArray.length;
				console.log(this.perfectDataLength, "this.perfectDataLength");
			})
			return rst;
		});
	}
	@action updatePerfectInfoData(data) {
		runInAction(() => {
			this.perfectData = data;
		})
	}
	@action savePerfectInfo(data) {
		return savePerfectInfo(data);
	}
	@action getMineData() {
		return getAppConfig().then((config) => {
			if(isComeFromDistribution()) {
				wx.authorize({...config.authorize, redirectUrl: formatDisbUrl()});
				return;
			}
			return getMallConfigData().then(mallCOnfig => {
				return getMineData().then(rst => {
					rst.nav.data = rst.nav.data.map((item, index) => {
						if(index == 0) {
							item.icon = mallCOnfig.components.nav.data[0].icon;
						}
						return item;
					})
					runInAction(() => {
						this.mineData = {...rst, ...config};
					})
					return {...rst, ...config};
				})
			})
	    })	    
	}

	@action updateApplyData(data) {
		runInAction(() => {
			this.applyData = data;
		})
	}
	
	@action doApply() {
		return doApply(this.applyData).then(rst => {
			return rst;
		});
	}
	@action sendPerfectMsg(data) {
		return sendPerfectMsg(data);
	}
	@action doSendVCode(data) {
		return doSendVCode(data);
	}

	@action isApply() {
		return isApply().then((rst) => {
			runInAction(() => {
				this.isCanBeDistributor = rst.isCanBeDistributor;
			})
			return rst;
		})
	}
	
	@action clearApplyData() {
		runInAction(() => {
			this.applyData={};
		});
	}
}

const MineState = new Store();

export default MineState;