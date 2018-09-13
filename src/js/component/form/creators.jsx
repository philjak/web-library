/* eslint-disable react/no-deprecated */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const deepEqual = require('deep-equal');
const { splice } = require('../../utils');
const { removeKeys } = require('../../common/immutable')
const CreatorField = require('./creator-field');
const Button = require('../ui/button');
const Icon = require('../ui/icon');
const { enumerateObjects } = require('../../utils');

class Creators extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isCreatorTypeEditing: false,
			creators: enumerateObjects(
				props.value.length ? props.value : [this.newCreator]
			)
		};
		this.fields = {};
	}

	componentWillReceiveProps(props) {
		let creators = this.state.creators;
		if(!deepEqual(this.props.value, props.value)) {
			creators = props.value.length ? props.value : [this.newCreator];
		}
		if(!deepEqual(this.props.creatorTypes, props.creatorTypes)) {
			const validCreatorTypes = props.creatorTypes.map(ct => ct.value);
			creators = creators.map(creator => ({
					...creator,
					creatorType: validCreatorTypes.includes(creator.creatorType) ? creator.creatorType : validCreatorTypes[0]
				}));
		}
		this.setState({ creators: enumerateObjects(creators) });
	}

	componentDidUpdate(props, state) {
		if(this.state.creators.length > state.creators.length) {
			let virtualEntryIndex = this.state.creators.findIndex(c => c[Symbol.for('isVirtual')]);
			if(virtualEntryIndex > -1) {
				this.fields[virtualEntryIndex].focus();
			}
		}
	}

	handleSaveCreators(creators) {
		this.setState({ creators });
		const newValue = creators
			.filter(creator => !creator[Symbol.for('isVirtual')]
				&& (creator.lastName || creator.firstName || creator.name)
			).map(creator => removeKeys(creator, 'id'));
		const hasChanged = !deepEqual(newValue, this.props.value);
		this.props.onSave(newValue, hasChanged);
	}

	handleValueChanged(index, key, value) {
		const creators = [...this.state.creators];
		creators[index] = {
			...creators[index],
			[key]: value
		};
		if((creators[index].lastName || creators[index].firstName || creators[index].name)
			&& creators[index][Symbol.for('isVirtual')]) {
			delete creators[index][Symbol.for('isVirtual')];
		}
		this.handleSaveCreators(creators);
	}

	handleCreatorAdd({ id, creatorType }) {
		let insertAfterIndex = this.state.creators.findIndex(c => c.id === id);
		let newCreator = {
			creatorType,
			firstName: '',
			lastName: '',
			[Symbol.for('isVirtual')]: true
		};

		this.setState({
			creators: enumerateObjects([
				...this.state.creators.slice(0, insertAfterIndex + 1),
				newCreator,
				...this.state.creators.slice(insertAfterIndex + 1, this.state.creators.length),
			])
		});
	}

	handleCreatorRemove(index) {
		if(this.state.creators.length > 1) {
			this.handleSaveCreators(splice(this.state.creators, index, 1));
		} else {
			this.handleSaveCreators([this.newCreator]);
		}
	}

	handleCreatorTypeSwitch(index) {
		const creators = [...this.state.creators];

		if('name' in creators[index]) {
			let creator = creators[index].name.split(' ');
			creators[index] = {
				lastName: creator.length > 0 ? creator[creator.length - 1] : '',
				firstName: creator.slice(0, creator.length - 1).join(' '),
				creatorType: creators[index].creatorType,
				[Symbol.for('isVirtual')]: creators[index][Symbol.for('isVirtual')]
			};
		} else if('lastName' in creators[index]) {
			creators[index] = {
				name: `${creators[index].firstName} ${creators[index].lastName}`.trim(),
				creatorType: creators[index].creatorType,
				[Symbol.for('isVirtual')]: creators[index][Symbol.for('isVirtual')]
			};
		}

		this.handleSaveCreators(creators);
	}

	handleReorder(fromIndex, toIndex) {
		const creators = [ ...this.state.creators ];
		creators.splice(toIndex, 0, creators.splice(fromIndex, 1)[0]);
		this.setState({ creators });
	}

	handleReorderCommit() {
		this.handleSaveCreators(this.state.creators);
	}

	handleReorderCancel() {
		this.setState({ creators: enumerateObjects(this.props.value) });
	}

	get newCreator() {
		return {
			creatorType: this.props.creatorTypes[0].value,
			firstName: '',
			lastName: '',
			[Symbol.for('isVirtual')]: true
		};
	}

	get hasVirtual() {
		return !!this.state.creators.find(creator => creator[Symbol.for('isVirtual')]);
	}

	renderField(creator, index) {
		const isVirtual = creator[Symbol.for('isVirtual')] || false;
		const props = {
			creator,
			creatorTypes: this.props.creatorTypes,
			index,
			isCreateAllowed: !this.hasVirtual,
			isDeleteAllowed: !isVirtual || this.state.creators.length > 1,
			isForm: this.props.isForm,
			isVirtual,
			isSingle: this.state.creators.length === 1,
			onChange: this.handleValueChanged.bind(this),
			onCreatorAdd: this.handleCreatorAdd.bind(this),
			onCreatorRemove: this.handleCreatorRemove.bind(this),
			onCreatorTypeSwitch: this.handleCreatorTypeSwitch.bind(this),
			onDragStatusChange: this.props.onDragStatusChange,
			onReorder: this.handleReorder.bind(this),
			onReorderCancel: this.handleReorderCancel.bind(this),
			onReorderCommit: this.handleReorderCommit.bind(this),
			readOnly: this.props.readOnly,
			ref: ref => this.fields[index] = ref
		};
		return <CreatorField key={ creator.id } { ...props } />;
	}

	render() {
		let creators = this.state.creators;

		return (
			<React.Fragment>
				{ creators.map(this.renderField.bind(this)) }
				{ this.props.isEditing && (
					<li className="metadata add-creator">
						<Button
							className="btn-plus"
							onClick={ this.handleCreatorAdd.bind(
								this, creators[creators.length - 1])
							}
						>
							<Icon type={ '16/plus' } width="16" height="16" />
						</Button>

						<div>Add Creator</div>
					</li>
				)}
			</React.Fragment>
		);
	}
	static defaultProps = {
		value: []
	};

	static propTypes = {
		creatorTypes: PropTypes.array.isRequired,
		isForm: PropTypes.bool,
		name: PropTypes.string,
		onDragStatusChange: PropTypes.func,
		onSave: PropTypes.func,
		readOnly: PropTypes.bool,
		value: PropTypes.array,
	};
}

module.exports = Creators;
