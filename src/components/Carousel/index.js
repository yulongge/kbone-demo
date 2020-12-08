import React from 'react';
import { Carousel, WingBlank } from 'antd-mobile';


export default class _Carousel extends React.Component {

	constructor() {
		super();
		this.state = {
			imgHeight: document.body.clientWidth,
		}
	}
	
	componentDidMount() {
	// simulate img loading
		// setTimeout(() => {
		// 	this.setState({
		// 		data: ['AiyWuByWklrrUDlFignR', 'TekJlZRVCjLFexlOCuWn', 'IJOtIlfsYdTyaDTRVrLI'],
		// 	});
		// }, 100);
	}
	render() {

		const {data} = this.props;
		const {imgHeight } = this.state;
		return (
			<WingBlank>
			<Carousel
				dots={data.length > 1 ? true : false}
				autoplay={true}
				infinite >
				{data.map(val => (
				<a
					key={val}
					style={{ display: 'inline-block', width: '100%', height: `${imgHeight}px` }}
				>
					<img
					src={val+'?x-oss-process=image/auto-orient,1'}
					alt=""
					style={{ width: '100%', verticalAlign: 'top', height: '100%' }}
					onLoad={() => {
						// fire window resize event to change height
						window.dispatchEvent(new Event('resize'));
						this.setState({ imgHeight: 'auto' });
					}}
					/>
				</a>
				))}
			</Carousel>
			</WingBlank>
		);
	}
}