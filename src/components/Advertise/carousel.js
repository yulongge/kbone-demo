import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
@inject('store') 
@observer
export default class Carouse extends Component {
	constructor(props) {
		super(props);
		this.state = { currentIndex: 1, offset: -this.props.width, auto:null };
		this.renderChildren = this.renderChildren.bind(this);
		this.setIndex = this.setIndex.bind(this);
		this.autoplay = this.autoplay.bind(this);
		this.auto = null;
		this.visibilitychangefun = this.visibilitychangefun.bind(this);
	}

	renderChildren() {
		const { children, width, height,radius } = this.props;
		const childStyle = {
			width: width,
			height: height
		};

		if (!children) {
			return;
		}

		const appendedChildren = [
			children[children.length - 1],
			...children,
			children[0]
		];

		return React.Children.map(appendedChildren, (child, index) => {
			const childClone = React.cloneElement(child, { style: childStyle,className:(radius==1? 'hasradius': '')});

			return (
				<div
					className={radius==1? 'hasradius': ''}
					style={{
						display: 'inline-block'
					}}
					key={index}
				>
					{childClone}
				</div>
			);
		});
	}

	setIndex(index) {
		const len = this.props.children.length;
		// console.log("888888888888888",len)
		if(len>1){
			let nextIndex = index;
			if(nextIndex>len+1){
				nextIndex = 0
			}
			const { width } = this.props;
			// this.setState({ currentIndex: nextIndex });
			const currentOffset = this.state.offset;
			const nextOffset = -nextIndex * width;
			let start = null;
			const move = timestamp => {
				if (!start) {
					start = timestamp;
				}
				const progress = timestamp - start;
				// console.log("progress",timestamp)
				this.setState({
					offset: currentOffset + (nextOffset - currentOffset) * progress / 500
				});

				if (progress < 500) {
					requestAnimationFrame(move);
				} else {
					if (nextIndex === 0) {
						nextIndex = len;
					} else if (nextIndex === len + 1) {
						nextIndex = 1;
					}
					this.setState({ currentIndex: nextIndex, offset: -nextIndex * width });
				}
			};

			requestAnimationFrame(move);
		}else{
			// clearInterval(this.state.auto);
			this.setState({ offset: 0 });
		}
		
	}
	visibilitychangefun(){
		let isHidden = document.hidden; 
		if (isHidden) { 
			// console.log("当前页面被隐藏",this.props)
			clearInterval(this.auto); 
		} else { 
			
			this.autoplay()
		} 
	}
	autoplay(){
		// let {data} = this.state;
		// console.log("从后台进入")
		clearInterval(this.auto);
		// let { data } = this.props;
		// const { type, pictures,widthtype,radius } = data.smConfig;
		this.auto = setInterval(()=>{
			this.setIndex(this.state.currentIndex + 1)
			// console.log("轮播",document.hidden,this.state.currentIndex,pictures.length)
			// if(document.hidden){
			//   clearInterval(this.auto);
			// }
		},3000)
		
	}
	

	componentDidMount(){
		// let {data} = this.state;
		const { children,imgindex } = this.props;
		// console.log("this.imgindex",this.state,imgindex)
		this.autoplay()

		document.removeEventListener('visibilitychange', this.visibilitychangefun,false);
		document.addEventListener('visibilitychange', this.visibilitychangefun, false);
	}
	componentWillUnmount(){
		// let {data} = this.state;
		clearInterval(this.auto);
		document.removeEventListener('visibilitychange', this.visibilitychangefun,false);
		this.setState = (state,callback)=>{
			return;
		};
	}
	componentWillReceiveProps(nextProps){
		// console.log("nextPropsnextPropsnextProps",nextProps)
		if(this.props.width != nextProps.width){
			this.setState({
				offset: 0
			})	
		}
			
	}
	render() {
		const { width, height, children, radius, widthtype } = this.props;
		const { currentIndex, offset } = this.state;
		// console.log("offsetoffsetoffsetoffsetoffsetoffset",offset)
		const frameStyle = {
			width: '100%',
			// width: Number(width) ? width+'px': width,
			height: Number(height) ? height+'px': height,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			position: 'relative'
		};

		const imageRowStyle = {
			marginLeft: offset
		};

		const buttonStyle = {
			position: 'absolute',
			top: '40%',
			bottom: '40%',
			width: '10%',
			background: 'rgba(0,0,0,0.2)',
			outline: 'none',
			border: 'none'
		};

		const leftButtonStyle = {
			...buttonStyle,
			left: 0
		};

		const rightButtonStyle = {
			...buttonStyle,
			right: 0
		};

		return (

			<div className={`carousel ${widthtype == 1 ? 'width100' : ''}`}>
				<div className={radius==1? 'frame hasradius': 'frame'} style={frameStyle}>
					{/* <button
						onClick={() => this.setIndex(currentIndex - 1)}
						style={leftButtonStyle}
					>
						&lt;
					</button> */}
					<div  style={imageRowStyle}>{this.renderChildren()}</div>
					{/* <button
						onClick={() => this.setIndex(currentIndex + 1)}
						style={rightButtonStyle}
					>
						&gt;
					</button> */}
				</div>
				<div className={children.length>1?"dotsbox":"disnone"}>
				{
					children.map((value, index)=>{
						return (
							<div 
							key={index} 
							className={(currentIndex-1)==index?'dots active':'dots'}></div>
						)
					})
				}
				</div>
				
			</div>
		);
	}
}