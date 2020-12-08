import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import {getFansData} from '../app_requests';
import update from "immutability-helper";
import {asArray} from '../utils/util';


useStrict(true);

class Store {

	constructor() {

	}

	@observable fansData = null;
	@observable isReachBottom = false;
	@observable myFansList = [];

	@action getFansData(data) {
		const {page} =data;
		return getFansData(data).then(rst => {
			runInAction(() => {
				this.fansData = rst;
				if(page == 1) {
					this.isReachBottom = false;
					this.myFansList = [];
				}
				if(rst.myfans && rst.myfans.length < 10) {
					this.isReachBottom = true;
				}
				this.fansData = rst;
				if(rst.myfans) {
					this.myFansList = this.myFansList.concat(rst.myfans);
				}
			})
			return rst;
		})
	}

}

const MyFansState = new Store();

export default MyFansState;