import React, {Component} from 'react';
import style from './style.less';

const NoData = (props) => {
	const {tip} = props;
	return	<div className={style.nodata}>
				<span className="icon"></span>
				<p>{tip}</p>
			</div>
}

export default NoData;