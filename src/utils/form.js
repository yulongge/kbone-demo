import formSerialize from 'form-serialize';
import { url } from 'mobile-utils';

const { query_params } = url;

export default {
	getDataFrom(form) {
		const s = formSerialize(form);
		return query_params(s);
	}
};