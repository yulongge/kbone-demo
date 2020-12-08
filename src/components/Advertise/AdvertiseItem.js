import React, { Component } from 'react';
import Carousel from "./carousel";
// import { observer, inject } from 'mobx-react';
import styles from "./styles.less";
import {word} from "Utils/locale";
import locale from "./locale";


class Comp extends Component {
	constructor(props) {
		super(props);
		this.state = {
			clientWidth: document.body.clientWidth
		};
	}


	render() {
		const {data} = this.props;
		let { pictures, style } = data;
		let { type, widthtype, radius, numberofsheets, margin} = style;
		const { clientWidth } = this.state;
		let numberofsheetsArray;
		margin = margin * 3;
		if(numberofsheets=="12" || numberofsheets=="21") {
			numberofsheetsArray = [...Array(2).fill().keys()];
		} else {
			numberofsheetsArray = [...Array(numberofsheets).fill().keys()];
		}
		pictures =  pictures && pictures.length && pictures.filter(item=> item.img);
		let cWidth = widthtype == 1 ? clientWidth-30 : clientWidth;
		let cHeight = cWidth * 0.33;
		const frameStyle = {
			height: cHeight
			// height: smType==="carousel"?(widthtype==1 ? 110 : 123):(heighttype==3?(widthtype==1 ? 67 : 75):(heighttype==2?(widthtype==1 ? 168 : 188):(widthtype==1 ? 210 : 235))),
		}; 
		const marginStyle = {
			marginRight: margin + 'px',
		};

		const marginR2Style = {
			marginLeft: -(margin*2/3)+'px',
			paddingLeft: (margin*2/3)+'px',
		};
		const marginRStyle = {
			marginLeft: -(margin*1/3)+'px',
			paddingLeft: (margin*1/3)+'px',
		};
		const marginLStyle = {
			marginLeft: margin*1/3+'px',
			paddingRight: margin*1/3+'px',
		};
		const marginL2Style = {
			marginLeft: margin*2/3+'px',
			paddingRight: (margin*2/3)+'px',
		};
		const marginStylenone = {};

		let componentClass;
		if(widthtype == 1) {
			if(type == 2) {
				componentClass = 'notrightmargin';
			}else{
				componentClass = 'notfill';

			}
		}else if(widthtype == 0) {
			if(type == 1) {
				componentClass = 'fixedfill';
			}else{
				componentClass = 'fill';
			}
		}

		console.log(numberofsheetsArray,"numberofsheetsArray.....")
		return  (
			
			<div 
			className= {`carouselContainer ${componentClass}  margin10`}>

			{
				((type)=>{
					switch(type) {
						case 0 :
							return <div className={`routinebox ww ${44}`}>
								<div className="picturesbox">
								{
									pictures && pictures.length > 0 ?
									<Carousel 
										widthtype={widthtype} 
										width={cWidth}
										height={frameStyle.height} 
										radius={radius} 
										data={style}>
										{
										pictures.map((value, index) =>(
											<img 
											src={value.img+'?x-oss-process=image/auto-orient,1'} 
											alt=""  
											key={index}
											onClick={this.props.toPage.bind(this,value.type, value.linkDetail )}/>
										))}
									</Carousel>
									:
									<div className="notupload" >
										<div className={radius==1? 'imgbox hasradius': 'imgbox'} style={frameStyle}>
											<div className="img" ></div>
											<div className="tipbox">
												{/* word(locale.ad.picWhTips,670,(frameStyle.height)*2) */}
												{word(locale.ad.picWhTips,670,220)}
											</div>
										</div>
										<div className="dotsbox">
											<div></div>
											<div></div>
											<div></div>
											<div></div>
										</div>
									</div>
								}
								
								</div>
								
							</div>;
						case 1 :
							return <div className="routinebox">
							{
								<div className={`fixedbox ${numberofsheets == 12 ? "twelveStyle" : (numberofsheets == 21 ? "twentyOneStyle" : '')  }`}>
								{
										
										numberofsheetsArray.map((value, index)=>{
											let numStr, numStr2, styleData;
											let picItem = pictures[index];
											if(numberofsheets == 1) {
												numStr = "w:750px";
											} else if(numberofsheets == 2) {
												numStr = "w:375px";
											} else if(numberofsheets == 12) {
												numStr = "w:500px";
												numStr2 = "w:250px";
											} else if(numberofsheets == 21) {
												numStr = "w:250px";
												numStr2 = "w:500px";
											} else if(numberofsheets == 3) {
												numStr = "w:250px";
											} else {
												numStr = "w:188px";
											}
											if(numberofsheets==12 && index == 0){
												styleData = marginR2Style
											}else if(numberofsheets==12 && index !== 0){
												styleData = marginLStyle
											}else if(numberofsheets==21 && index == 0){
												styleData = marginRStyle
											}else if(numberofsheets==21 && index !== 0){
												styleData = marginL2Style
											}else if(numberofsheets !== 12 && numberofsheets !== 21 && index !== numberofsheets-1){
												styleData = marginStyle;
											}
											
											return (
												<div 
													key={index} 
													onClick={this.props.toPage.bind(this, picItem.type, picItem.linkDetail )}
													className={radius==1? 'picbox hasradius': 'picbox'} 
													style={(numberofsheets !== 12 && numberofsheets !== 21) ? styleData : marginStylenone}>
												{
													picItem && picItem.img ?
														<img className={radius==1? 'hasradius': ''} src={picItem.img+'?x-oss-process=image/auto-orient,1'} alt="" style={styleData}/>
													: 
														<div className={radius==1? 'noimage hasradius': 'noimage'} style={(numberofsheets == 12 || numberofsheets == 21)? styleData: marginStylenone}>
															<div className="img"></div>
															<div className="tipbox">
															
															{ index== 1 && numberofsheets==12 
																|| index== 1 && numberofsheets==21 
																|| numberofsheets==1 
																|| numberofsheets==2 
																|| numberofsheets==3  
																|| numberofsheets==4 ? 
																numStr 
																: 
																numStr2
															}

															</div>
														</div>
												}
												</div>
											)
										})
								} 
								</div>
							}
							</div>;
						// case 2 :
						// 	return <div className="routinebox">
						// 	{
						// 		<div className="slidebox">
						// 		{
						// 			[...Array(5).fill().keys()].map((value, index)=>{
						// 				return (
						// 					<div className={"picbox " +"widthstyle"+numberofsheets} key={index} style={index !== numberofsheets&&widthtype? marginStyle : marginStylenone}>
						// 					{
						// 						pictures.slice()[index] ?
						// 							<img className={radius==1? 'hasradius': ''} src={pictures[index].picurl} alt=""/>
						// 						: 
						// 							<div className={radius==1? 'noimage hasradius': 'noimage'}>
						// 								<div className="img"></div>
						// 								<div className="tipbox">{numberofsheets==2?"w:320px":(numberofsheets==3?"w:180px" : "w:540px")}</div>
						// 							</div>
						// 					}
						// 					</div>
						// 				)
						// 			})
						// 		}
						// 		</div>
						// 	}
						// 	</div>;
						default:
							break;
					}
				})(type)
			}
			</div>
		)
	}
}

export default Comp;









