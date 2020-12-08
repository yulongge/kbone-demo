import React, {Component} from 'react';
import {getQrcode, getParam} from '../../utils/util';
import locale from "./locale";

export default class GoodItem extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const {item, newStyle} = this.props;
		
		return 	<div className="goods_box" onClick={this._goDetail.bind(this, item.pid)}>
					{
						item.imageUrl &&
						<img className="good_img" 
							src={item.imageUrl+'?x-oss-process=image/auto-orient,1'} 
							style={newStyle} 
							onError={e => {
								this._imgOnError(e);
							}}/>
					}
					
                    <p className="good_title">{item.name}</p>
                    <p className="good_subtitle">{item.subtitle}</p>
                    <div className="good_detail">
						<p className="good_price">
							{
								//<span className="symbol">{locale.goodshelves.symbol}</span>
							}
							<span className="price" dangerouslySetInnerHTML={{__html: item.price}}></span>
						</p>
                        {
							//<p className="purchased">{item.purchased}{locale.goodshelves.purchased}</p>
						}
						<p className="add-cart" onClick={this.props.addToCart.bind(this, item )}>
							<img src="https://welifestatic.oss-cn-beijing.aliyuncs.com/images/manage/2018/mall/decorate/index/shop.png" />
						</p>
                    </div>
                </div>
	}

	_goDetail(pid) {
		//location.href = `/product/detail/${pid}`;
		//this.props.history.push(`/v2/product/detail/${pid}?qrcode=${getQrcode()}`)
		//location.href = `/v2/product/detail/${pid}?qrcode=${getQrcode()}`;
		location.assign(`/v2/product/detail/${pid}?qrcode=${getQrcode()}&uid=${getParam('uid')}`);
	}

	_imgOnError(e) {
		console.log(e, 'errormsg')
	}

	
}