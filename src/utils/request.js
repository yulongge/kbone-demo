import 'whatwg-fetch';
import Promise from 'native-promise-only';
import { keys, delay, isObject, extend, pick } from 'lodash';
import { mock_prefix } from '../dev.server';
import AppState from '../stores/AppState';
import wx from './wx';

const FETCH_TIMEOUT = 20 * 1000;
const FETCH_EXCEPTION = "_fetch_timeout_";
const _fetch = window.fetch;
window.fetch = function() {
	const fetchPromise = _fetch.apply(null, arguments);
	const timeoutPromise = new Promise(function(res, rej) {
		setTimeout(
			()=>rej(new Error(FETCH_EXCEPTION)),
			FETCH_TIMEOUT
		)
	});
	return Promise.race([fetchPromise, timeoutPromise]);
};

export const isBadRequest = status=>(status>=400 && status<=600);

export const isValidCode = code=>{
	let c = parseInt(code); return (!isNaN(c)) && (c == 0)
};

export default {
	request: method=>(url, params, errCallback)=>{
		AppState.setRequesting(true);

		let reqUrl = `${mock_prefix}${url}`;
		if (AppState.config) {
			const rp = AppState.config.requests_proxy;
			if (isObject(rp)) {
				let re = null;
				for (let k in rp) {
					re = new RegExp(k);
					if (re.test(url)) {
						reqUrl = url.replace(re, rp[k]);
						console.log(`request: ${url} --> ${reqUrl}`)
						
						break;
					}
				}
			}
		}

		let reqObj = {
			method,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: params
				? method === 'GET'
					? keys(params).reduce((arr, key)=>{
						if (!!params[key])
							arr.push(`${key}=${params[key]}`);
						return arr;
					}, []).join('&')
					: JSON.stringify(params)
				: null,
			credentials: 'include',
			cache: 'reload'
		};

		if (reqObj.body === null) {
			delete reqObj.body;
		} else if (method === 'GET') {
			let divSign = ~reqUrl.indexOf('?') ? '&' : '?';
			reqUrl += divSign + reqObj.body;
			delete reqObj.body;
		}

		//reqUrl = "http://lilong.mall.dev.acewill.net/mall/pageConfigs/getMainPageConfigs?qrcode=m14987906505802"
		//const req = new Request(`http://hh.mall.dev.acewill.net` + reqUrl, reqObj);
		const req = new Request(reqUrl, reqObj);

		const _err = (msg, res) => {
			if (typeof errCallback === 'function')
				errCallback(msg, res);
			else
				if (!('errlevel' in res) || res.errlevel === 'page') {
					console.log(AppState.history, 'history')
					// AppState.history.push(`/msg/`, {
					// 	message: `request failure ${msg ? ', '+msg : ''}`,
					// 	response: res
					// });
				} else if (res.errlevel === 'alert') {
					if ('showWarn' in AppState) AppState.showWarn(res.errmsg, 'warn');
					else window.alert(res.errmsg);
				} else { // errlevel === 'console'
					console.log('ERR: ', res);
				}
			AppState.setRequesting(false);
		};
		console.log(`[fetch] ${req.method} ${req.url}`);
		console.log(params,"【***请求数据***】")
		return fetch(req)
			.then(res=>{
				if (isBadRequest(res.status)) {
					let ex = `state: ${res.status}`;
					_err(ex, res);
					//throw new Error(ex);
				}
				return res.json();
			}).then(json=>{
				let { errcode, errmsg, result/*errlevel*/} = json;
				console.log(result,"【***接口返回数据***】")
				if(errcode != 0) {
					if(errcode == '402') {
						const {pathname} = AppState.history.location; 
						if(result && 'authorize' in result) {
							wx.authorize({...result.authorize, redirectUrl: window.location.href});
							//wx.authorize({...result.authorize, redirectUrl:'http://lolong.mall.dev.acewill.net/mall/shoppingcart/operate'});
							//http://h5.dev.acewill.net/?code=081PJSBm0SVQds18HuBm0F22Cm0PJSBl&state=STATE  http://h5.dev.acewill.net
						} else {
							console.error(`无授权信息返回`, 'errmsg')
						}
						
					} else {
						_err(errmsg, json);
					}
					
					AppState.setRequesting(false);
					return;
				}
				if (!result) result = {};
				if ('route' in result) {
					let {route, routeDelay, routeAfterMsg} = result;
					const _jump = timeout=>delay(
						/^(https?\:)?\/{2}/.test(route)
							? ()=>location.href=route
							: ()=>AppState.history.push(route, {
								timestamp: (new Date).getTime()
							}),
						timeout
					);
					if (routeAfterMsg) { //先显示提示页面再跳转
						_err(errmsg, json);
						delay(()=>_jump(routeDelay || 0), 1000);
					} else { //在当前页面跳转
						_jump(routeDelay || 0);
					}
				}
				if (!isValidCode(errcode)) {
					let ex = `bussiness logic wrong (code: ${errcode})`;
					_err(ex, json);
					//throw new Error(ex);
				}
				AppState.setRequesting(false);
				return result;
			}).catch(ex=>{
				AppState.setRequesting(false);
				if (ex.message === FETCH_EXCEPTION) {
					window.alert("请求超时");
					return;
				}
				// console.warn(ex.message);
				throw ex;
			});
	},
	get(...args) {
		return this.request('GET')(...args);
	},
	post(...args) {
		return this.request('POST')(...args);
	},
	sequence(reqPromises, autoMerge=true) {
		let results = [];
		return reqPromises.reduce(
			(promise, req)=>promise.then(
				()=>req.then(result=>results.push(result)).catch(ex=>Promise.reject(ex))
			), Promise.resolve()
		).then(
			()=>autoMerge
				? results.reduce((rst, curr)=>extend(rst, curr), {})
				: results
		);
	}
}
