'use strict';

import React from 'react';
import { connect } from 'react-redux';

import ItemsSortModal from '../../component/modal/items-sort-modal';
import withDevice from '../../enhancers/with-device.js';
import { SORT_ITEMS } from '../../constants/modals';
import { toggleModal, updateItemsSorting, updateCollection } from '../../actions';


class ItemsSortModalContainer extends React.PureComponent {
	render() {
		return <ItemsSortModal { ...this.props } />;
	}
}

const mapStateToProps = state => {
	const isOpen = state.modal.id === SORT_ITEMS;
	const preferences = state.preferences;
	const isMyLibrary = (state.config.libraries.find(l => l.key === state.current.libraryKey) || {}).isMyLibrary;
	return { preferences, isOpen, isMyLibrary };
};


export default withDevice(
	connect(mapStateToProps, { updateCollection, updateItemsSorting, toggleModal }
)(ItemsSortModalContainer));
