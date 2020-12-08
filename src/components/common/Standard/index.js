import React, {Component} from 'react';
import style from './style.less';
import locale from './locale';
import NumberStepper from "../NumberStepper";

export default class Standard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			product: this.props.data,
			currentStandard: this.props.data.standard[0],
			currentStandardInd: 0,
			shopCount: 1
		}
	}

	componentWillReceiveProps(props,newProps) {
		console.log(props,newProps,"props,newProps..")
	}

	render() {
		const {product, shopCount} = this.state,
			{ standard} = product,
			{showMember, symbol, currentStandard, activeIdx, curMembershipLevel} = this.props;
		let _currentStandard = currentStandard ? currentStandard : this.state.currentStandard;

		console.log(product,"product.......")
		return 	<div className={style.standard}>
			<div className="shade" onClick={this.props.closeStandard.bind(this)}></div>
			<div className="content">
				<div className="msg">
					<img src={product.pic || product.imageUrl} />
					<div className="price">
						<div className="vip_price">
							<span className="number"
								dangerouslySetInnerHTML={{__html:`${this.props._getMemberPrice(_currentStandard)}` }}>
							</span> 
							{
								showMember &&
								<span className="member">{curMembershipLevel ? curMembershipLevel.levelName : product.curMembershipLevel.levelName}</span>
							}
							
						</div>
						{
							showMember &&
							<div className="common_price">
								<span>{locale.price.commonvip}</span>
								<span className="number" 
									dangerouslySetInnerHTML={{__html:`${symbol}${_currentStandard.unitPrice}` }}>
								</span> 
							</div>
						}
						{
							!showMember && _currentStandard.unitDiscountPrice != 0 &&
							<div className="common_price">
								<span>{locale.price.originalPrice}</span>
								<span className="number" 
									dangerouslySetInnerHTML={{__html:`${symbol}${_currentStandard.unitPrice}` }}>
								</span> 
							</div>
						}
						
					</div>
				</div>
				<div className="standard">
					<i className="standard_itle">{locale.standard.title}</i>
					<div className="category">
						{
							standard && standard.length &&
							standard.map((item, index) => {
								return 	<span 
											key={index}
											className={`${activeIdx == index ? 'active' : ''}`}
											onClick={this._selectStandard.bind(this, item, index)} >
											{item.title}
										</span>
							})
						}
					</div>
				</div>
				<div className="buyCount">
					<i className="standard_itle">{locale.standard.buyCount}</i>
					<span className="store" 
						dangerouslySetInnerHTML={{__html:`${locale.store} ${_currentStandard.onhand}` }}>
					</span>
					<NumberStepper
						currentStandardInd={activeIdx}
						minCount={1}
						maxCount={_currentStandard.onhand}
						defaultCount={1}
						setCount={this._setCount.bind(this)} />
				</div>
				<span 
					className="confirm" 
					onClick={this.props._confirmShopCard.bind(this, _currentStandard, shopCount)}>{locale.confirm}</span>
			</div>
		</div>
	}

	_setCount(count) {
		console.log(count,"count....")
		const { currentStandard } = this.props;
		let _currentStandard = currentStandard ? currentStandard : this.state.currentStandard;
		const { onhand } = this.state.currentStandard;
		
		if(count >= onhand) {
			this.props.overOhandToast();
			return;
		}
		this.setState({
			shopCount: count
		})
	}

	_selectStandard(item, index) {
		this.setState({
			currentStandard: item,
			currentStandardInd: index
		})
		this.props.setCurrentStandard(item, index);
		this.props.showMemberPrice(item);
	}
}