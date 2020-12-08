import React from 'react';
import style from './style.less';
import {getQrcode, getParam} from '../../utils/util';
import { Icon } from 'antd-mobile';


export default class BreadCrumb extends React.Component {
	constructor(props) {
		super(props);
		this.state={
			activeIndex:0
		}
	}

	componentDidMount() {
		// let {curCategoryId} = this.props;
		// if(curCategoryId) {
		// 	this._resetPos(curCategoryId);
		// }
	}

	componentWillReceiveProps(nextProps) {
		// const nextCurId = nextProps.curCategoryId,
		// 	prevCurId = this.props.curCategoryId;
		// if(nextCurId != prevCurId) {
		// 	this._resetPos(nextCurId);
		// }
	}

	render() {
		let {
			breadcrumbData,
			curCategoryId,
			allData
		} = this.props;
		const _this = this;
		if(!(breadcrumbData && breadcrumbData.data && breadcrumbData.data.length)) {
			return null;
		}
		if(!curCategoryId) {
			curCategoryId = breadcrumbData.data[0].cid;
		}

		return	<div className={style.breadcrumb} >
					<ul className="breadcrumblist"
						style={{
							backgroundColor: breadcrumbData.style.bgColor,
							color: breadcrumbData.style.fontColor
						}}>
						<div 
						className="search_icon" 
						style={{
							backgroundColor: breadcrumbData.style.bgColor
						}}
						onClick={this.gotoSearch.bind(this)}><Icon type="search" size='sm' /></div>
					{ 
						breadcrumbData.data.map(function(item,idx){
							return (
								<li 
									ref={`c_${item.cid}`}
									key={idx} 
									onClick={_this._goCategory.bind(_this, item.cid)}
									className={curCategoryId == item.cid ? 'active' : null}>
										<a>
										{item.name}
										</a>
								</li>
							)
						})
					}
					</ul>
							
				</div>
		
	}

	getUid() {
		const {allData} = this.props;
		let {uid} = allData ? allData : {};
		if(getParam('uid') && getParam('uid') != "null" && getParam('uid') != 'undefined') {
			uid = getParam('uid');
		}
		return uid;
	}

	_goCategory(cid) {

		let uid = this.getUid();
		console.log(uid, 'uid')
		if(!cid) {
			location.href = `/index?qrcode=${getQrcode()}&uid=${uid}`;
			//this.props.history.push(`/index?qrcode=${getQrcode()}`);
		} else {
			this.props.history.push(`/v2/category/${cid}?qrcode=${getQrcode()}&uid=${uid}`);
		}
	}

	gotoSearch() {
		let uid = this.getUid();
		let url = `/v2/search?qrcode=${getQrcode()}&uid=${uid}`;
		this.props.history.push(url);
	}


	_resetPos(curId) {
		let curCategory = this.refs['c_' + curId];
		const offsetL = curCategory.offsetLeft-110;
		document.querySelector(".breadcrumblist").scrollLeft = offsetL;
	}


}