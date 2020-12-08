import wx from 'weixin-js-sdk';
import {delUrlParam, concatParam} from './util';

export default {
	init: function(config) {
		console.log(config,"config...pay")
		wx.config({
			debug: false, // 开启调试模式,
			appId: config.appId, // 必填，公众号的唯一标识
			timestamp: config.timestamp, // 必填，生成签名的时间戳
			nonceStr: config.nonceStr, // 必填，生成签名的随机串
			signature: config.signature,// 必填，签名
			jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'hideMenuItems', 'hideAllNonBaseMenuItem', 'chooseWXPay','getLocation'] // 必填，需要使用的JS接口列表
		});

		wx.ready(function() {
			console.log('wx config ready');
			
		})

		wx.error(function(res){
			console.error(res, 'wx config params error');
		})
	},
	checkApi: function() {
		wx.checkJsApi({
			jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', "hideMenuItems", "hideAllNonBaseMenuItem",'chooseWXPay' ], // 需要检测的JS接口列表，所有JS接口列表见附录2,
			success: function(res) {
				console.log(res, 'wx config checkApi')
			// 以键值对的形式返回，可用的api值true，不可用为false
			// 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
			}
		});
	},
	share: function(title, desc, link, imgUrl, params) {
		console.log(title, desc, link, imgUrl, params, 'share')
		
		if(params) {
			const {uid} = params;
			if(uid) {
				link = delUrlParam(link, 'uid');
				link = concatParam(link, 'uid', uid);
			}
		}
		console.log(link, 'link')
		wx.ready(function() {
			wx.onMenuShareAppMessage({ 
				title: title, // 分享标题
				desc: desc, // 分享描述
				link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
				imgUrl: imgUrl, // 分享图标
				success: function () {
					console.log('share to appMessage set success ! ')
				}
			})
	
		
			wx.onMenuShareTimeline({ 
				title: title, // 分享标题
				link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
				imgUrl: imgUrl, // 分享图标
				success: function () {
					console.log('share to timeLine set success ! ')
				}
			})
		});
		
		
	},
	hideMenu: function() { //隐藏菜单 只能隐藏“传播类”和“保护类”按钮
		// 传播类
		// 发送给朋友: "menuItem:share:appMessage"
		// 分享到朋友圈: "menuItem:share:timeline"
		// 收藏: "menuItem:favorite"
		// 分享到QQ: "menuItem:share:qq"
		// 分享到Weibo: "menuItem:share:weiboApp"
		// 分享到FB: "menuItem:share:facebook"
		// 分享到 QQ 空间: "menuItem:share:QZone"

		// 保护类
		// 编辑标签: "menuItem:editTag"
		// 删除: "menuItem:delete"
		// 复制链接: "menuItem:copyUrl"
		// 原网页: "menuItem:originPage"
		// 阅读模式: "menuItem:readMode"
		// 在QQ浏览器中打开: "menuItem:openWithQQBrowser"
		// 在Safari中打开: "menuItem:openWithSafari"
		// 邮件: "menuItem:share:email"
		// 一些特殊公众号: "menuItem:share:brand"
		wx.hideAllNonBaseMenuItem();
		// wx.hideMenuItems({
		// 	menuList: [
		// 		"menuItem:share:appMessage",
		// 		"menuItem:share:timeline",
		// 		"menuItem:share:qq",
		// 		"menuItem:share:weiboApp",
		// 		"menuItem:share:facebook",
		// 		"/menuItem:share:QZone",
		// 		"menuItem:editTag",
		// 		"menuItem:openWithQQBrowser",
		// 		"menuItem:openWithSafari",
		// 		"menuItem:share:email",
		// 		"menuItem:share:brand",
		// 		"menuItem:copyUrl",
		// 	]
		// })
	},
	authorize: function(authorizeMsg) {
		let callbackUrl = delUrlParam(authorizeMsg.redirectUrl, 'code');
		callbackUrl = delUrlParam(callbackUrl, 'appid');
		callbackUrl = delUrlParam(callbackUrl, 'scope');
		callbackUrl = delUrlParam(callbackUrl, 'state');
		
		console.log(callbackUrl, 'callbackUrl')
		let authroizeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${authorizeMsg.appId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${authorizeMsg.scope}&state=STATE&component_appid=${authorizeMsg.component_appid}#wechat_redirect`;
		window.location.href = authroizeUrl;
	}
}