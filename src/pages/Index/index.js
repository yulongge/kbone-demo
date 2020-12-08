import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

@inject('store')
@observer
export default class Index extends Component {

	constructor(props) {
		super(props);
	}

	componentWillMount() {
		this.props.store.MallState.getCurEnv();
		
	}
	

	componentDidMount() {		
		this.props.store.MallState.getMallConfig().then((rst) => {
			const {mallData}=this.props.store.MallState;
			// document.body.style.backgroundColor = mallData.components ? mallData.components.backgroundColor.data : '#fff';
			//分享
			if(!rst) return;
			setDocumentTitle(rst.mallName);
			const { newLoopbanner } = mallData.components,
				imgUrl = newLoopbanner && newLoopbanner.pictures && newLoopbanner.pictures.length ? newLoopbanner.pictures[0].img : "";
			this.props.store.AppState.requestConfig(rst);
			wx.init({...rst.wxConfig})  
			console.log(rst,  'config')
			wx.share(rst.mallName, "", window.location.href, imgUrl);
		});
	}


	onTimerFinish() {
		this.props.store.MallState.getMallConfig();
	}

	gotoCart(url) {
		this.props.history.push(url);
	}

	render() {
	
		return 	<div >
					index				
				</div>
	}

}