import { observable, action, runInAction, useStrict } from 'mobx';
import {getSearchResult} from '../app_requests';


useStrict(true);

class Store {

	constructor() {

	}

	@observable searchHistory = [];
	@observable isReachBottom = false;
	@observable goodsList = [];

	@action getSearchResult(data) {
		const {page} = data;
		return getSearchResult(data).then(rst => {
			runInAction(() => {
				
				if(page == 1) {
					this.isReachBottom = false;
					this.goodsList = [];
				}
				
				if((rst.goodsList && rst.goodsList.length < rst.pageSize)) {
					this.isReachBottom = true;
				}
				if(rst.goodsList) {
					this.goodsList = this.goodsList.concat(rst.goodsList);
				}
				this.searchResult = rst;
			})
			return rst;
		})
	}
	
	@action setSearchHistory(item) {
		console.log(item,"item......")
		let keyWord = String(item.trim());
		let key = 'mall_search_history';
		let _historyArr = this.getSearchHistory();
		if(_historyArr && _historyArr.length) {
			let _itemIdx = _historyArr.indexOf(keyWord);
			console.log(_itemIdx,"_itemIdx....")
			if(_itemIdx == -1){
				_historyArr.push(keyWord);
			}else {
				_historyArr.splice(_itemIdx,1);
				console.log(_historyArr,"_historyArr.......")
				_historyArr.unshift(keyWord);
				console.log(_historyArr,"_historyArr.......2222")

			}
		}else {
			_historyArr = [].concat([keyWord]);
		}

		localStorage.setItem(key, JSON.stringify(_historyArr));
	}
	
	@action getSearchHistory() {
		let key = 'mall_search_history';
		let historyArr = JSON.parse(localStorage.getItem(key));
		if(historyArr) {
			historyArr = historyArr.length > 50 ? historyArr.slice(0,50) : historyArr;
		}else {
			historyArr = [];
		}
		this.searchHistory = historyArr;
		return historyArr;
	}

	@action clearResult() {
		this.goodsList = [];
	}


}

const SearchState = new Store();

export default SearchState;