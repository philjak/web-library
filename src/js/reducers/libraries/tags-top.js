'use strict';

import {
	ERROR_TAGS_IN_TOP_ITEMS,
	RECEIVE_CREATE_ITEM,
	RECEIVE_CREATE_ITEMS,
	RECEIVE_RECOVER_ITEMS_TRASH,
	RECEIVE_TAGS_IN_TOP_ITEMS,
	REQUEST_TAGS_IN_TOP_ITEMS,
	RECEIVE_MOVE_ITEMS_TRASH,
	RECEIVE_UPDATE_ITEM,
	RECEIVE_COLORED_TAGS_IN_TOP_ITEMS,
} from '../../constants/actions';
import { populateTags, updateFetchingState } from '../../common/reducers';

const tagsTop = (state = {}, action) => {
	switch(action.type) {
		case REQUEST_TAGS_IN_TOP_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
			}
		case RECEIVE_TAGS_IN_TOP_ITEMS:
			return {
				...state,
				...populateTags(state, action.tags, action),
				...updateFetchingState(state, action),
			};
		case RECEIVE_COLORED_TAGS_IN_TOP_ITEMS:
			return {
				...state,
				coloredTags: action.tags.map(t => t.tag)
			}
		case ERROR_TAGS_IN_TOP_ITEMS:
			return {
				...state,
				...updateFetchingState(state, action),
			};
		case RECEIVE_CREATE_ITEM:
			return 'tags' in action.item && action.item.tags.length > 0 ?
				{} : state;
		case RECEIVE_CREATE_ITEMS:
		case RECEIVE_MOVE_ITEMS_TRASH:
		case RECEIVE_RECOVER_ITEMS_TRASH:
			return action.items.some(item => 'tags' in item && item.tags.length > 0) ?
				{} : state;
		case RECEIVE_UPDATE_ITEM:
			return 'tags' in action.patch ? {} : state;
		default:
			return state;
	}
};

export default tagsTop;
