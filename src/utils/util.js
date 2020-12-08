import _ from 'underscore';
import cookie from 'js-cookie';
import { domainToASCII } from 'url';

//转成数组
export const asArray = obj => _.isArray(obj) ? obj : [obj];

//从已选择的货品中剔除数量为0的
export let notZero = selectedArr => {
	let arr = selectedArr;
	for (var i = 0; i < arr.length; i ++) {
		let item = arr[i].standard;
		arr[i].standard = item.filter(p=>p.count);
	}
	return arr = arr.filter(p=>p.standard.length);
};

//获取地址参数
export function getParam(name) {
	let reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	let r = window.location.search.substr(1).match(reg);
	console.log(r, 'r')
	if(r!=null) return unescape(r[2]); 
	return null;
}

export function getParams() {
	var url = location.search; //获取url中"?"符后的字串
	var theRequest = new Object();
	if (url.indexOf("?") != -1) {
		var str = url.substr(1);
		var strs = str.split("&");
		for(var i = 0; i < strs.length; i ++) {
			theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
		}
	}
	return theRequest;
}

export function delUrlParam(url, ref) { //链接删除参数
	 // 如果不包括此参数
	if (url.indexOf(ref) == -1)
		return url;
	let arr_url = url.split('?'),
		base = arr_url[0],
		arr_param = arr_url[1].split('&'),
		index = -1;
	for(let i = 0; i < arr_param.length; i++) {
		let paired = arr_param[i].split('=');
		if (paired[0] == ref) {
			index = i;
			break;
		}
	}

	if(index == -1) {
		return url;
	} else {
		arr_param.splice(index, 1);
		return base + "?" + arr_param.join('&');
	}
}

export function getQrcode() {
	return cookie.get("qr");
}
export function getCode() {
	return cookie.get("code");
}

export function concatParam(url, name, value) { //链接追加参数
	var currentUrl =url.split('#')[0];
	if (/\?/g.test(currentUrl)) {
		if (/name=[-\w]{4,25}/g.test(currentUrl)) {
			currentUrl = currentUrl.replace(/name=[-\w]{4,25}/g, name + "=" + value);
		} else {
			currentUrl += "&" + name + "=" + value;
		}
	} else {
		currentUrl += "?" + name + "=" + value;
	}
	
	return currentUrl;
}

//获取滚动条当前的位置 
export function getScrollTop() {
	var scrollTop = 0;
	if(document.documentElement && document.documentElement.scrollTop) {
		scrollTop = document.documentElement.scrollTop;
	} else if(document.body) {
		scrollTop = document.body.scrollTop;
	}
	return scrollTop;
}

//获取当前可视范围的高度 
export function getClientHeight() {
	var clientHeight = 0;
	if(document.body.clientHeight && document.documentElement.clientHeight) {
		clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight);
	} else {
		clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
	}
	return clientHeight;
}

//获取文档完整的高度 
export function getScrollHeight() {
	return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
}

export function setDocumentTitle(title = 'index') { //设置页面title
	if(window.document.title === title)
		return;
	document.title = title
	const mobile = navigator.userAgent.toLowerCase()
	if(/iphone|ipad|ipod/.test(mobile)) {
		let iframe = document.createElement('iframe')
		iframe.style.display = 'none'
		// 替换成站标favicon路径或者任意存在的较小的图片即可
		//iframe.setAttribute('src', '/favicon.ico')
		let iframeCallback = function () {
			setTimeout(function () {
				iframe.removeEventListener('load', iframeCallback)
				document.body.removeChild(iframe)
			}, 0)
		}
		iframe.addEventListener('load', iframeCallback)
		document.body.appendChild(iframe)
	}
}

export function formatPrice(price = 0) { //处理价格小数点显示
	let newPrice = price.toString();
	const priceArr = newPrice.split(".");
	if(priceArr.length > 1) {
		let dotNum = priceArr[1];
		if(dotNum.toString().length < 2) {
			dotNum = dotNum.toString() + 0;
		}
		newPrice = priceArr[0] + '<i class="small">.'+ dotNum +'</i>'
	} else {
		newPrice = priceArr[0];
	}
	return newPrice;
}

export function isComeFromDistribution() {
	let isDb = false;
	console.log(getParams(), 'app portral coming....')
	const {marketingDid, marketingDtid, marketingTid, isRedirectByWelife, qrcode, response_type, scope, state} = getParams();
	if((marketingDid || marketingDtid || marketingTid) && !isRedirectByWelife) {
		isDb = true;
	}
	return isDb;
}

export function formatDisbUrl() {
	let url = location.href;
	url = concatParam(url, "isRedirectByWelife", true);
	return url;
}

export const trim = str => str.replace(/(^\s+|\s+$)/g, '');
