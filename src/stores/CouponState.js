import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import { 
	getCouponList
} from '../app_requests';




useStrict(true);

class Store {

	constructor() {
	}

	@observable couponListData = null;
	
	@action getCouponList(data) {
		return getCouponList(data).then(rst => {
			runInAction(() => {
				this.couponListData = rst;
			})
			return rst;
		})
	}

	
}

const CouponState = new Store();
export default CouponState;