import React, {
	Component
} from 'react';
import { Icon } from 'react-weui';
import style from './style.less';

const Tip = (props) => {
	const {
		type,
		tip
	} = props;
	return 	<div className={`Tip ${type}`}>
                {
					//<Icon value={type} />
				}
                <span className="tip">{tip}</span>
            </div>
}

export default Tip;