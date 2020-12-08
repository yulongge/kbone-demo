import requestUtil from './utils/request';
import request from './utils/request';

//取得应用全局配置
export const getAppConfig = ()=>requestUtil.get(`/pageConfigs/initConfigs/?time=`+(new Date()).getTime());

//取得应商城首页配置
export const getMallConfigData = ()=>requestUtil.get(`/pageConfigs/getMainPageConfigs/?time=` + (new Date()).getTime());

//取得商品详情
export const getProductDetail = (data)=>requestUtil.get(`/goods/${data.id}/?time=` + (new Date()).getTime());

//加入购物车
export const plusShopCard = (data)=>requestUtil.post(`/shoppingcart/operate`, {...data});

//获取分类下的商品信息
export const getCategoryData = (data) => requestUtil.get(`/categories/${data.id}/${data.page}/?time=` + (new Date()).getTime(), {...data});

//获取拼团活动商品列表
export const getGrouponData = (data) => requestUtil.get(`/groupon/${data.id}/${data.page}/?time=` + (new Date()).getTime());

//获取订单列表
export const getOrderListData = (data) => requestUtil.get(`/order/allList/${data.page}?statusList=${data.state}`,{...data});

//获取订单详情
export const getOrderDetailData = (data) => requestUtil.get(`/order/allList/detail/${data.id}`);
//获取我的信息
export const getMineData = () => requestUtil.get(`/mine`);

//获取粉丝信息
export const getFansData = (data) => requestUtil.get(`/fans/${data.page}`);

//获取收入数据
export const getIncomeData = () => requestUtil.get(`/income`);

//获取粉丝订单列表
export const getFansOrderListData = (data) => requestUtil.get(`/order/fans/list/${data.page}?status=${data.state}`);

//获取账单详情
export const getIncomeDetailData = (data) => requestUtil.get(`/income/detail/${data.page}`);

//申请代言人
export const doApply = (data) => requestUtil.post(`/mine/apply`,{...data});

//发送验证码
export const doSendVCode = (data) => requestUtil.get(`/app/sendvcode/${data.phone}`,{...data});

//检测是否能成为分销员
export const isApply = () => requestUtil.get(`/mine/isApply`);

//确认收货
export const orderReceipt = (data) => requestUtil.post(`/order/receipt/`,{...data});

//取余额到储值卡
export const cashOut = () => requestUtil.post(`/income/cashout`);

//删除订单
export const orderDel = (data) => requestUtil.post(`/order/del`,{...data});

//取消订单
export const orderCancel = (data) => requestUtil.post(`/order/cancel/${data.orderId}`,{...data});

//获取默认地址
export const getDefaultAddress = () => requestUtil.get(`/address/default`);

//获取支付信息
export const getPayInfo = (data) => requestUtil.post(`/pay/info`,{...data});

//获取优惠券信息（用于购物时选择券）
export const getCouponList = () => requestUtil.get(`/coupon`);

//获取预支付数据
export const payConfirm = (data) => requestUtil.post(`/pay_confirm/${data.orderId}`,{...data});

//交易验证发送短信
export const paySendsms = (data) => requestUtil.post(`/pay_sendsms`, {...data});

//提交商品信息
export const ordering = (data, errCallback) => requestUtil.post(`/ordering`, {...data}, errCallback);

//提交支付结果
export const payResult = (data) => requestUtil.post(`/payresult`, {...data});

//获取地址列表
export const getAddressList = () => requestUtil.get(`/address/list`);

//编辑地址
export const editAddress = (data) => requestUtil.get(`/address/detail/${data.id}`);

//保存地址
export const saveAddress = (data) => requestUtil.post(`/address/save`, {...data});

//删除地址
export const delAddress = (data) => requestUtil.post(`/address/del/${data.id}`, {...data});

//获取京东地址(省份)
export const getJdAddress = (data) => requestUtil.get(`/address/jdAddress/${data.id}/${data.level}`);

//获取京东地址(市县街道)
export const getFullProvince = (data) => requestUtil.get(`/welife-mall/jd/listFullProvince?id=${data.id}`);

//获取购物车信息
export const getCartList = (data) => requestUtil.get(`/cart/list`);

//加减数量，更新购物车
export const cartUpdate = (data) => requestUtil.post(`/cart/update`,{...data});

// 获取完善资料信息
export const getPerfectInfo = () => requestUtil.get(`/frontend/mall/user/getPerfectUserInfo/`);

// 提交完善资料信息
export const savePerfectInfo = (data) => requestUtil.post(`/frontend/mall/user/perfectUserInfo/`, {...data});

// 完善资料发送短信
export const sendPerfectMsg = (data) => requestUtil.post(`/frontend/mall/user/sendSmsVerifyCode/`, {...data});


//绑定手机
export const bindPhone = (data) => requestUtil.post(`/frontend/bindPhone`, {...data});


//提交绑定手机号验证码
// export const postSmsCode = (data) => requestUtil.post('/SmsVerifyCode', {...data});

//提交密码/短信验证码
export const tradeVerify =(data) => requestUtil.post(`/pay_tradeVerify`, {...data});

//继续支付
export const payContinue = (data) => requestUtil.post(`/order/pay_continue`, {...data});

// 售后/退后申请
export const applyforRefund = (data) => requestUtil.post(`/order/applyforRefund`, {...data});

// 售后/退后申请 所上传图片base64转os地址
export const conversionUploadImg = (data) => requestUtil.post(`/order/conversionUploadImg`, {...data});

// 自取码
export const getSelfTakeCode = (data) => requestUtil.get(`/order/getSelfTakeCode`, {...data});

// 门店列表
export const getShopList = (data) => requestUtil.get(`/mall/shopList`, {...data});

// 同城配送 : 配送门店
export const getShopInfo = (data) => requestUtil.get(`/mall/shopDetail`, {...data});

//搜索商品
export const getSearchResult = (data)  => requestUtil.get(`/products/searchResult`, {...data});
