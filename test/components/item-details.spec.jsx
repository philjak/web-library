'use strict';

const assert = require('chai').assert;
const React = require('react');
const { render } = require('enzyme');
const ItemDetails = require('../../src/js/component/item/details');
const itemsFixture = require('../fixtures/items');


describe('<ItemDetails />', () => {
	var items;
	
	beforeEach(() => {
		items = itemsFixture.map(i => ({
			...i.data,
			...i.meta
		}));
	});

	it('renders tabs & tab contents', () => {
		const wrapper = render(
			<ItemDetails item={ items[0] } />
		);

		assert.equal(wrapper.find('.item.details>.panel>.panel-header .tabs>.tab').length, 5);
		assert.equal(wrapper.find('.item.details>.panel>.panel-body>.tab-pane').length, 5);
		assert.equal(wrapper.find('.item.details>.panel>.panel-header .tabs>.tab.active>a').text(), 'Info');
		assert.equal(wrapper.find('.item.details>.panel>.panel-body>.tab-pane.info.active').length, 1);
	});	
});