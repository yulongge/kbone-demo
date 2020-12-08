import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import {getIncomeData, getIncomeDetailData, cashOut} from '../app_requests';
import update from "immutability-helper";
import {asArray} from '../utils/util';


useStrict(true);

class Store {

	constructor() {

	}

	@observable incomeData = null;
	@observable incomeDetailData = null;
	@observable isReachBottom = false;
	@observable billList = [];

	@action getIncomeData() {
		return getIncomeData().then(rst => {
			runInAction(() => {
				this.incomeData = rst;
			})
			return rst;
		})
	}

	@action getIncomeDetailData(data) {
		const {page} = data;
		return getIncomeDetailData(data).then(rst => {
			runInAction(() => {
				if(page == 1) {
					this.isReachBottom = false;
					this.billList = [];
				}
				if(rst.billList.length < 10) {
					this.isReachBottom = true;
				}
				this.incomeDetailData = rst;
				this.billList = this.billList.concat(rst.billList);
			})
			return rst;
		})
	}

	@action cashOut() {
		return cashOut().then(rst => {
			return rst;
		});
	}

}

const IncomeState = new Store();

export default IncomeState;