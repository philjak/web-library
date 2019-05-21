'use strict';

import cx from 'classnames';
import Dropdown from 'reactstrap/lib/Dropdown';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from './ui/icon';
import { noteAsTitle } from '../common/format';

class Note extends React.PureComponent {
	state = { isOpen: false }
	handleToggleDropdown = () => this.setState({ isOpen: !this.state.isOpen })
	handleSelect = () => {
		const { note, onSelect } = this.props;
		onSelect(note);
	}
	handleDelete = () => {
		const { note, onDelete } = this.props;
		onDelete(note);
	}
	handleDuplicate = () => {
		const { note, onDuplicate } = this.props;
		onDuplicate(note);
	}
	render() {
		const { device, isSelected, isReadOnly, note } = this.props;
		const { isOpen } = this.state;
		return (
			<li
				className={ cx('note', { 'selected': isSelected }) }
				onClick={ this.handleSelect }
			>
				<Icon type={ '28/note'} width="28" height="28" className="hidden-mouse" />
				<div className="multiline-truncate">
					{ note.note && noteAsTitle(note.note) || <em>Untitled Note</em> }
				</div>
				{ !isReadOnly && (
					<Dropdown
						isOpen={ isOpen }
						toggle={ this.handleToggleDropdown }
						className="dropdown-wrapper"
					>
						<DropdownToggle
							color={ null }
							className={ cx('dropdown-toggle', {
								'btn-link': device.isTouchOrSmall,
								'btn-icon': !device.isTouchOrSmall,
							})}
						>
							<Icon
								type={ '24/options' }
								symbol={ isOpen ? 'options-block' : 'options' }
								width="24"
								height="24"
								className="touch"
							/>
							<Icon type={ '16/options' } width="16" height="16" className="mouse" />
						</DropdownToggle>
						<DropdownMenu>
							<DropdownItem onClick={ this.handleDuplicate }>
								Duplicate
							</DropdownItem>
							<DropdownItem onClick={ this.handleDelete }>
								Delete
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				)}
				<Icon type={ '16/chevron-13' } width="16" height="16" className="hidden-mouse" />
			</li>
		);
	}

	static propTypes = {
		device: PropTypes.object,
		isReadOnly: PropTypes.bool,
		isSelected: PropTypes.bool,
		note: PropTypes.object,
		onDelete: PropTypes.func,
		onDuplicate: PropTypes.func,
		onSelect: PropTypes.func,
	}
}

export default Note;
