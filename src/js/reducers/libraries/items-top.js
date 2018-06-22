'use strict';

const {
	RECEIVE_CREATE_ITEM,
	RECEIVE_DELETE_ITEM,
	RECEIVE_DELETE_ITEMS,
	RECEIVE_TOP_ITEMS,
} = require('../../constants/actions.js');

const itemsTop = (state = [], action) => {
	switch(action.type) {
		case RECEIVE_CREATE_ITEM:
			// @TODO:
			return state;
		case RECEIVE_DELETE_ITEM:
			return state.filter(key => key !== action.item.key);
		case RECEIVE_DELETE_ITEMS:
			return state.filter(key => !action.itemKeys.includes(key));
		case RECEIVE_TOP_ITEMS:
			return [
				...(new Set([
					...state,
					...action.items.map(item => item.key)
				]))
			];
		default:
			return state;
	}
};

module.exports = itemsTop;
