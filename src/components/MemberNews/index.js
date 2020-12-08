import React from 'react';
import locale from "./locale";
import style from './style.less';

export default class MemberNews extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			timer: null,
			offset: 0,
			activeIndex: 0,
			direction: 'up'
		}
	}

	componentDidMount() {
		
		if(this.state.timer) {
			clearInterval(this.state.timer);
		}
		if(this.props.membernewsData.data && this.props.membernewsData.data.length > 1) {
			const timer = setInterval(() => {
				const ul = this.refs.news;
				if(ul) {
					const itemHeight = ul.clientHeight / ul.children.length;
					this.loopAnimat(itemHeight);
				}
			}, 3000);
			this.setState({
				timer: timer
			});
		}
	
	}

	componentWillReceiveProps(newProps) {
		if(this.state.timer) {
			clearInterval(this.state.timer);
		}
		if(newProps.membernewsData.data && newProps.membernewsData.data.length > 1) {
			const timer = setInterval(() => {
				const ul = this.refs.news;
				if(ul) {
					const itemHeight = ul.clientHeight / ul.children.length;
					this.loopAnimat(itemHeight);
				}
			}, 3000);
			this.setState({
				timer: timer
			});
		}
	}
	componentWillUnmount() {
		clearInterval(this.state.timer);
		this.setState = (state, callback) => {
			return;
		};
	}

	loopAnimat(itemHeight) {

		//console.log(itemHeight);
		let start = null;
		let run = timestamp => {
			let {
				offset,
				activeIndex,
				direction
			} = this.state;

			if(!start) start = timestamp;
			let progress = timestamp - start;
			let newOffset = direction == 'up' ? (activeIndex * -itemHeight - Math.min(progress * itemHeight / 500, itemHeight)) : (itemHeight - Math.min(progress * itemHeight / 500, itemHeight));
			this.setState({
				offset: newOffset
			});
			if(progress < 500) {
				window.requestAnimationFrame(run);
			} else {
				let newIndex = activeIndex + 1;
				if(newIndex >= (this.props.membernewsData.data.length - 1)) {
					direction = 'down';
					newIndex = 0;
				} else {

					if(direction == 'down' && activeIndex == 0) {
						newIndex = 0;
					}
					direction = 'up';
				}
				this.setState({
					activeIndex: newIndex,
					direction: direction
				});
			}
			//console.log(this.state.activeIndex)
		}
		window.requestAnimationFrame(run);

	}

	render() {
		const {
			membernewsData
		} = this.props;
		const {
			offset
		} = this.state;
		return(
			<div className={style.membernews} >
				{
					!!(membernewsData.data&&membernewsData.data.length)&&
					<div  style={{color:membernewsData.style.contentColor?membernewsData.style.contentColor:null}}>
						<span style={{color:membernewsData.style.titleColor?membernewsData.style.titleColor:null}}>{locale.title}</span>
						
						<ul style={{top:offset+'px'}} ref="news">
						{
							membernewsData.data.map(function(item,idx){
								return (
									<li key={idx}>{item}</li>			
								)
							})
						}
						</ul>
						
					</div>		
				}										
			</div>
		)
	}
}