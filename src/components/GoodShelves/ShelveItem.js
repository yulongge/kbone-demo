import React, {Component} from 'react';
import locale from "./locale";
import {getQrcode, getParam} from '../../utils/util';
import styles from './style.less';


const ShelveItem = (props) => {
	const {data} = props;
	return 	<div className="goods_box" onClick={props._goDetail.bind(this,data.pid)}>
				{
					data.imageUrl &&
					<img className="good_img" 
						src={data.imageUrl+'?x-oss-process=image/auto-orient,1'} 
						style={props.newStyle} 
						onError={e => {
							props._imgOnError(e);
						}}/>
				}
					
				<p className="good_title">{data.name}</p>
				<p className="good_subtitle">{data.subtitle}</p>
				<div className="good_detail">
					<p className="good_price">
						{
							//<span className="symbol">{locale.goodshelves.symbol}</span>
						}
						<span className="price" dangerouslySetInnerHTML={{__html: data.price}}></span>
					</p>
					{
						//<p className="purchased">{data.purchased}{locale.goodshelves.purchased}</p>
					}
					<p className="add-cart" onClick={props.addToCart.bind(this, data )}></p>
				</div>
			</div>
}

export default ShelveItem;