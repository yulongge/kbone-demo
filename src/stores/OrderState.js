import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import { 
	getOrderListData, 
	getOrderDetailData, 
	getFansOrderListData,
	orderReceipt,
	orderCancel,
	orderDel, 
	payContinue,
	getSelfTakeCode 
} from '../app_requests';
import wx from 'weixin-js-sdk';
import cookie from 'js-cookie';

const VERIFYSTATUS = {
	BINDPHONE: 1 ,
	VERIFY_PAY: 2,
	VERIFY_SMS: 3
};

useStrict(true);

class Store {

	constructor() {

	}

	@observable orderData = null;
	@observable fansOrderData = null;
	@observable orderDetail = null;
	@observable isPaying = false;
	@observable selfCodeDetail = null;
	@observable isVirtualProduct = false;

	@action getOrderListData(data) {
		return getOrderListData(data).then(rst => {
			runInAction(() => {
				if(rst.page == 1) {
					this.orderData = rst;
					this.orderData.hasMore = rst.orders.hasMore;
					this.orderData.list = rst.orders.list;
				} else {
					if(this.orderData.page!=rst.page){
						this.orderData.page = rst.page;
						this.orderData.hasMore = rst.orders.hasMore;
						this.orderData.cartListNum = rst.cartListNum;
						this.orderData.list = this.orderData.list.concat(rst.orders.list);
					}
				}
				console.log("getOrderListData完成", this.orderData)
			})
			return rst;
		})
	}

	@action getFansOrderListData(data) {
		return getFansOrderListData(data).then(rst => {
			runInAction(() => {
				if(rst.page == 1) {
					this.fansOrderData = rst;
				} else {
					if(this.fansOrderData.page!=rst.page){
						this.fansOrderData.page = rst.page;
						this.fansOrderData.hasMore = rst.hasMore;
						this.fansOrderData.cartListNum = rst.cartListNum;
						this.fansOrderData.list = this.fansOrderData.list.concat(rst.list);
					}
				}
				console.log("getFansOrderListData完成", this.fansOrderData)
			})
			return rst;
		})
	}

	@action getOrderDetailData(data) {
		return getOrderDetailData(data).then(rst => {
			runInAction(() => {
				this.orderDetail = rst;
				const { products } = rst;
				let isVirtual = products.some((item)=>{
					return item.isVirtual;
				});
				this.isVirtualProduct = isVirtual;
			})
			return rst;
		})
	}


	
	@action orderReceipt(data,page) {
		return orderReceipt(data).then(rst=>{
			runInAction(() => {
				if(page=='list'){
					this.orderData.list.map(item=>{
						if(item.id==data.orderId){
							item.state=0;
						}
					})
				}else if(page=='detail'){
					this.orderDetail.state=0;
				}				
			})
		});
	}
	
	//暂无删除订单
	@action orderDel(data,page) {
		return orderDel(data).then(rst=>{
			runInAction(() => {
				
			})
		});
	}
	
	@action orderCancel(data,page) {
		return orderCancel(data).then(rst=>{
			runInAction(() => {
				if(page=='list'){
					this.orderData.list.map(item=>{
						if(item.id==data.orderId){
							item.state=8;
						}
					})
				}else if(page=='detail'){
					this.orderDetail.state=8;
				}				
			})
		});
	}


	@action continuePay() {
		this.isPaying = true;
		const {id }  = this.orderDetail;
		const data = {
			orderId: id
		};
		const _this = this;

		wx.miniProgram.getEnv(function(res) { 
			console.log(res.miniprogram,"getCurrentEnv");
			const isInMiniprogram = res.miniprogram ? 2 : 1;    //当前环境: 小程序:2, JSAPI: 1
			const whereFrom = cookie.get('whereFrom');
			console.log(data,"postPayData...")
			data.payScene = isInMiniprogram;
			data.whereFrom = whereFrom;
			payContinue(data).then(rst=>{
				console.log(rst.payParams, rst.payParams.orderId,  "prepay--rst");
				const { payParams, needWePay } = rst;
				const { orderId } = payParams;
				console.log(needWePay,"needWePay....")
				if(!!needWePay) {
					const payData = payParams;
					_this.gotoPay(isInMiniprogram, payData);

				}else{
					console.log(needWePay,"needWePay....")
					const payResult = 1;
					window.location = `/v2/payresult?payResult=${payResult}&orderId=${orderId}`; 
				}
			}).catch(err=>{
				runInAction(()=>{
					_this.isPaying = false;
				})

			});
		});
	}

	@action _getSelfTakeCode(data) {
		getSelfTakeCode(data).then(rst=>{
			console.log(rst,'selfCode......')
			runInAction(()=>{
				this.selfCodeDetail = rst;
			})
		})
	}

	

	//去支付
	gotoPay(isInMiniprogram, payData) {
		
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

		console.log(payData, "wxPay....");
		
		const { payFrom, partPay,orderId } = payData;
		
		console.log(orderId, payData,"wxPay---payData");

		window.WeixinJSBridge.invoke(
		   'getBrandWCPayRequest',
		   {...payData},
		   function(res){

			if (res.err_msg == 'get_brand_wcpay_request:ok') {
				console.log('success_pay_wx : 支付成功--success ', res );
				location.replace(`/v2/payresult?payResult=1&&orderId=${orderId}&payFrom=${payFrom}&partPay=${partPay}`);

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

const OrderState = new Store();
export default OrderState;