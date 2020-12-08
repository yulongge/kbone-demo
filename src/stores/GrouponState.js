import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import {getGrouponData} from '../app_requests';

useStrict(true);

class Store {

	constructor() {

	}

	@observable grouponData = null;
	@observable goodsList = [];
	@observable isReachBottom = false;

	@action getGrouponData(data) {
		return getGrouponData(data).then(rst => {
			runInAction(() => {
				if(rst.goodsList.length <= 4 || (rst.goodsList.length < 10 && data.page > 1) || rst.activityStatus == 1 || rst.activityStatus == 3) {
					this.isReachBottom = true;
				}
				this.goodsList = this.goodsList.concat(rst.goodsList);
				this.grouponData = rst;
			})
			return rst;
		})
	}

	@action setIsReachBottom(flag) {
		this.isReachBottom = flag;
	}

}

const GrouponState = new Store();
export default GrouponState;