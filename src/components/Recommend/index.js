import React, {Component} from 'react';
import styles from './style.less';
import {getQrcode, getParam} from '../../utils/util';
import GoodShelves from "Components/GoodShelves";
import Standard from "Components/common/Standard";

export default class Recommend extends Component {
	constructor(props) {
		super(props);
	}
	componentWillMount() {

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

	render() {
		const { data,curMembershipLevel} = this.props;

		const {style, title} = data;
		let newStyle = {}, titleStyle={};
		if(style.radius) {
			newStyle = {
				borderRadius: "10px"
			}
		}
		titleStyle = {
			color: style.color
		};
	
		
		return 	<div className={styles.recommend}>	
				<div className={this.props.activeComp?'active':null}>
					<div className="title" style={titleStyle}>
						<span>{title}</span>
					</div>
					{
						data.products && data.products.length ?
						<GoodShelves
							style={newStyle}
							curMembershipLevel={curMembershipLevel}
							data={data.products} />
						:
						null
					}
				</div>
				</div>
	}
}