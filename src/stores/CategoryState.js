import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import {getCategoryData} from '../app_requests';
import update from "immutability-helper";
import {asArray} from '../utils/util';

useStrict(true);

class Store {

	constructor() {

	}

	@observable currentCategoryList = [];
	@observable isReachBottom = false;

	@action getCurCategoryData(data) {
		console.log(data,"data......getCurCategoryData")
		return getCategoryData(data).then(rst => {
			
			runInAction(() => {
				if(data.isDiff) {
					this.currentCategoryList = [];
					this.isReachBottom = false;
				}
				if(!rst.goodsList || rst.goodsList.length <= 4 || (rst.goodsList.length < 10 && data.page > 1)) {
					this.isReachBottom = true;
				}
				this.currentCategoryList = this.currentCategoryList.concat(rst.goodsList);
				// if(this.currentCategoryList.length >= rst.goodsTotal) {
				// 	this.isReachBottom = true;
				// }
			})

			return rst;
		})
	}

	@action setIsReachBottom(flag) {
		this.isReachBottom = flag;
	}

}

const CategoryState = new Store();
export default CategoryState;