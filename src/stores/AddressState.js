import { observable, action, runInAction, useStrict, computed, autorun, toJS } from 'mobx';
import {getAddressList, editAddress, saveAddress, delAddress, getJdAddress,getFullProvince} from '../app_requests';
import update from "immutability-helper";
import {asArray} from '../utils/util';


useStrict(true);

class Store {

	constructor() {

	}

	@observable addressData = null;
	@observable addressEdit = null;

	@action getAddressList() {
		getAddressList().then(rst => {
			runInAction(() => {
				this.addressData = rst;
			})
		})
	}
	@action editAddress(data) {
		return editAddress(data).then(rst => {
			runInAction(() => {
				this.addressEdit = rst;
			});
			return rst;
		})
	}
	@action saveAddress(data) {
		return saveAddress(data);
	}
	@action delAddress(data) {
		return delAddress(data);
	}
	@action updateEditAddress(data) {
		this.addressEdit = data;
	}
	@action getJdAddress(data) {
		return getJdAddress(data);
	}
  @action getFullProvince(data) {
		return getFullProvince(data);
	}
}

const AddressState = new Store();

export default AddressState;