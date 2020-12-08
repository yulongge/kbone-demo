import { observable, action, runInAction, useStrict } from 'mobx';
import cookie from 'js-cookie';
import {getParam, getParams, delUrlParam} from '../utils/util';
import { delay } from 'lodash';
import wx from 'weixin-js-sdk';
import { getAppConfig } from '../app_requests';

useStrict(true);

let AppState = observable({
	history: null,
	initRouter: action.bound(function(router) {
		console.log(router, 'router')
		if (router) {
			this.history = router.history;
		}
	}),
	authorizeInit: function() {
		console.log(location.href, location.href.indexOf('mall'), location.href.indexOf('index'), 'authorizeInit')
		//whereFrom {无：会员卡小程序, 1: 会员卡小程序, 2: 点餐小程序}
		const unionid = getParam("unionid"),
			whereFrom = getParam("whereFrom"),
			comeOpenId = getParam("comeOpenId"),
			code = getParams()["code"];

		if(unionid) {
			cookie.set('unionid', unionid);
		} else {
			cookie.remove('unionid');
		}

		if(code) {
			cookie.set('code', code)
		} else {
			//cookie.remove('code');
		}

		if(location.href.indexOf('index') != -1 || location.href.indexOf('product/detail') != -1 || location.href.indexOf('category') != -1) {
			if(cookie.get('whereFrom') == 1) {
				cookie.remove('whereFrom');
			}
			if(whereFrom == 1) {
				cookie.set('whereFrom', 1)
			}
			if(!cookie.get('whereFrom')) {
				if(whereFrom) {
					cookie.set('whereFrom', whereFrom);
				} else {
					cookie.set('whereFrom', 1);
				}
			}
		}

		if(comeOpenId) {
			cookie.set('comeOpenId', comeOpenId);
		}

	},

	setMarketingDid : function() {
		console.log(location.href,"location.href")
		let did = getParam('did');
		if(did) {
			sessionStorage.setItem('Marketing_did', did);
		}

		this.checkIsFromMarketIng();
	},

	checkIsFromMarketIng: function() {
		const marketingDid = getParam("marketingDid");

		if(marketingDid && marketingDid != "null" && marketingDid != "undefined") {
			let key  = "mall_marketing_did";
			sessionStorage.setItem(key, marketingDid);
		}
	},
	getMarketingDid: function() {
		let key  = "mall_marketing_did";
		let marketingDid = sessionStorage.getItem(key);
		console.log(marketingDid,"getMarketingDid.......")
		if(marketingDid && marketingDid != "null" && marketingDid != "undefined") {
			return marketingDid;
		}else{
			return false;
		}
	},
	requesting: false,
	setRequesting: action.bound(function(bool) {
		delay(
			()=>runInAction(
				()=>this.requesting = bool
			),
			bool?0:300
		);
	}),

	config: null,
	// requestConfig: action.bound(function() {
	// 	return getAppConfig().then(rst=>{
	// 		runInAction(
	// 			()=>this.config=rst
	// 		);
	// 		return rst;
	// 	});
	// }),

	requestConfig: action.bound(function(config) {
		this.config = config;
		return config;
	}),
	getAppConfig: action.bound(function() {
		return getAppConfig().then(rst=>{
			runInAction(
				()=>{
					this.config=rst;
					console.log(this.config,"config....");
				}
				
			);
			return rst;
		});
	}),

	warn: null,
	warnType: 'success',
	showWarn: action.bound(function(msg, type, timeout=2000) {
		this.warn = msg;
		this.warnType = type;
		delay(
			()=>runInAction(
				()=>this.warn = null
			),
			timeout
		);
	}),
	dialogText: null,
	dialogOkBtn: '确定',
	dialogOkCallBack: function() {},
	cancelCallBack: function() {},
	cancelText: null,
	showDialog: action.bound(function(msg, callback, okBtn, cancelCallBack, cancelText) {//msg:提示信息,callback:第一个按钮回调,okBtn:第一个按钮文案,cancelCallBack:第二个按钮事件回调, cancelText: 第二个按钮文案
		const _this = this;
		this.dialogText = msg;
		this.dialogButtons = [{
			label: this.dialogOkBtn,
			onClick: this.hideDialog
		}];
		if(callback || okBtn) {
			this.dialogButtons[0] = {
				label: okBtn ? okBtn : this.dialogOkBtn,
				onClick: function() {
					_this.hideDialog();
					if(callback) callback();
					else _this.dialogOkCallBack();
				}
			}
		}

		if(cancelCallBack || cancelText) {
			this.dialogButtons.push({
				label: cancelText ? cancelText : this.cancelText,
				onClick: function() {
					_this.hideDialog();
					if(cancelCallBack) cancelCallBack();
					else this.cancelCallBack();
				}
			})
		}
		
	}),
	dialogButtons: [],
	hideDialog: action.bound(function(msg) {
		this.dialogText = null;
	})
});

export default AppState;
