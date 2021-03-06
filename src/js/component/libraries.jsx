import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Button from './ui/button';
import CollectionTree from '../component/libraries/collection-tree';
import cx from 'classnames';
import Icon from './ui/icon';
import Node from './libraries/node';
import Spinner from './ui/spinner';
import { get, stopPropagation } from '../utils';
import { pick } from '../common/immutable';
import withFocusManager from '../enhancers/with-focus-manager';
import { createCollection, fetchAllCollections, fetchLibrarySettings, navigate } from '../actions';


const LibraryNode = props => {
	const {
		addVirtual, collectionsCount, isFetching, isOpen, isPickerMode, isReadOnly, isSelected,
		libraryKey, name, pickerNavigate, pickerPick, pickerState, picked, pickerIncludeLibraries, shouldBeTabbable,
		toggleOpen, virtual
	} = props;
	const dispatch = useDispatch();
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);


	// no nodes inside if device is non-touch (no "All Items" node) and library is read-only (no
	// trash) and has no collections
	const isConfirmedEmpty = isReadOnly && !isTouchOrSmall && collectionsCount === 0;

	const handleClick = useCallback(() => {
		if(isPickerMode) {
			pickerNavigate({ library: libraryKey, view: 'library' });
		} else {
			dispatch(navigate({ library: libraryKey, view: 'library' }, true));
		}
	});

	const handlePickerPick = useCallback(() => {
		pickerPick({ libraryKey });
	});

	const handleAddVirtualClick = useCallback(() => {
		addVirtual(libraryKey);
	});

	const handleOpenToggle = useCallback((ev, shouldOpen = null) => {
		toggleOpen(libraryKey, shouldOpen);
	});

	const getTreeProps = () => {
		const parentLibraryKey = libraryKey;
		const isVirtualInThisTree = virtual && virtual.libraryKey === libraryKey;

		return {
			...pick(props, ['addVirtual', 'cancelAdd', 'commitAdd',
			'onDrillDownNext', 'onDrillDownPrev', 'onFocusNext', 'onFocusPrev', 'selectedCollectionKey']),
			isPickerMode, parentLibraryKey, picked, pickerNavigate, pickerPick, pickerState,
			virtual: isVirtualInThisTree ? virtual : null,
		}
	}

	return (
		<Node
			className={ cx({
				'open': isOpen && !isFetching,
				'selected': isSelected,
				'busy': isFetching
			}) }
			tabIndex={ shouldBeTabbable ? "-2" : null }
			isOpen={ isOpen && !isFetching }
			onOpen={ handleOpenToggle }
			onClick={ handleClick }
			showTwisty={ !isConfirmedEmpty }
			subtree={ isFetching || isConfirmedEmpty ? null : isOpen ? <CollectionTree { ...getTreeProps() } /> : null }
			data-key={ libraryKey }
			dndTarget={ isReadOnly ? { } : { 'targetType': 'library', libraryKey: libraryKey } }
			{ ...pick(props, ['onDrillDownNext', 'onDrillDownPrev', 'onFocusNext', 'onFocusPrev'])}
		>
			{ isReadOnly ? (
				<React.Fragment>
					<Icon type="32/library-read-only" className="touch" width="32" height="32" />
					<Icon type="20/library-read-only" className="mouse" width="20" height="20" />
				</React.Fragment>
			) : (
				<React.Fragment>
					<Icon type="28/library" className="touch" width="28" height="28" />
					<Icon type="16/library" className="mouse" width="16" height="16" />
				</React.Fragment>
			) }
			<div className="truncate">{ name }</div>
			{ isPickerMode && pickerIncludeLibraries && !isFetching && (
				<input
					type="checkbox"
					checked={ picked.some(({ collectionKey: c, libraryKey: l }) => l === libraryKey && !c) }
					onChange={ handlePickerPick }
					onClick={ stopPropagation }
				/>
			)}
			{ isFetching && <Spinner className="small mouse" /> }
			{
				!isFetching && !isReadOnly && (
					<Button
						className="mouse btn-icon-plus"
						icon
						onClick={ handleAddVirtualClick }
						tabIndex={ -3 }
					>
						<Icon type={ '16/plus' } width="16" height="16" />
					</Button>
				)
			}
		</Node>
	);
}

LibraryNode.propTypes = {
	addVirtual: PropTypes.func,
	collectionsCount: PropTypes.number,
	isFetching: PropTypes.bool,
	isOpen: PropTypes.bool,
	isPickerMode: PropTypes.bool,
	isReadOnly: PropTypes.bool,
	isSelected: PropTypes.bool,
	libraryKey: PropTypes.string,
	name: PropTypes.string,
	picked: PropTypes.array,
	pickerIncludeLibraries: PropTypes.bool,
	pickerNavigate: PropTypes.func,
	pickerPick: PropTypes.func,
	pickerState: PropTypes.object,
	shouldBeTabbable: PropTypes.bool,
	toggleOpen: PropTypes.func,
	virtual: PropTypes.object,
};

const Libraries = props => {
	const { onBlur, onFocus, registerFocusRoot, isPickerMode, pickerState } = props;
	const dispatch = useDispatch();
	const libraries = useSelector(state => state.config.libraries);
	const librariesWithCollectionsFetching = useSelector(state => state.fetching.collectionsInLibrary);
	const isTouchOrSmall = useSelector(state => state.device.isTouchOrSmall);
	const stateSelectedLibraryKey = useSelector(state => state.current.libraryKey);
	const selectedLibraryKey = isPickerMode ? pickerState.libraryKey : stateSelectedLibraryKey;
	const stateView = useSelector(state => state.current.view);
	const view = isPickerMode ? pickerState.view : stateView;
	const itemsSource = useSelector(state => state.current.itemsSource);
	const collectionCountByLibrary = useSelector(state => state.collectionCountByLibrary);
	const hasMoreCollections = useSelector(state =>
		Object.keys(get(state, ['libraries', selectedLibraryKey, 'collections'], {})) < collectionCountByLibrary[selectedLibraryKey]
	);

	const myLibraries = useMemo(
		() => libraries.filter(l => l.isMyLibrary),
		[libraries]
	);
	const groupLibraries = useMemo(
		() => libraries.filter(l => l.isGroupLibrary),
		[libraries]
	);
	const otherLibraries = useMemo(
		() => libraries.filter(l => !l.isMyLibrary && !l.isGroupLibrary),
		[libraries]
	);

	const [opened, setOpened] = useState([]);
	const [virtual, setVirtual] = useState(null);

	const isRootActive = view === 'libraries';

	useEffect(() => {
		if(selectedLibraryKey) {
			toggleOpen(selectedLibraryKey, true);
			//@TODO: Minor opitimisation: only fetch library settings if needed
			dispatch(fetchLibrarySettings(selectedLibraryKey));
		}
	}, [selectedLibraryKey]);

	useEffect(() => {
		//@NOTE: this should only trigger when library is reset. Otherwise collections are fetched
		//		 by loader or when library is first opened. See #289
		if(hasMoreCollections) {
			dispatch(fetchAllCollections(selectedLibraryKey));
		}
	}, [hasMoreCollections]);

	const cancelAdd = () => {
		setVirtual(null);
	}

	const commitAdd = async (libraryKey, parentCollection, name) => {
		if(name === '') {
			setVirtual(null);
			return;
		}

		setVirtual({ ...virtual, isBusy: true });
		try {
			await dispatch(createCollection({ name, parentCollection }, libraryKey));
		} finally {
			setVirtual(null);
		}
	}

	const toggleOpen = (libraryKey, shouldOpen = null) => {
		const isOpened = opened.includes(libraryKey);

		if(shouldOpen !== null && shouldOpen === isOpened) {
			return;
		}
		isOpened ?
			setOpened(opened.filter(k => k !== libraryKey)) :
			setOpened([...opened, libraryKey ]);

		if(!isOpened) {
			dispatch(fetchAllCollections(libraryKey));
		}
	}

	const addVirtual = (libraryKey, collectionKey) => {
		if(!opened.includes(libraryKey)) {
			toggleOpen(libraryKey);
		}
		window.setTimeout(() => setVirtual({ libraryKey, collectionKey }));
	}

	const getNodeProps = libraryData => {
		const { key, ...rest } = libraryData;
		const shouldBeTabbableOnTouch = view === 'libraries';
		const shouldBeTabbable = shouldBeTabbableOnTouch || !isTouchOrSmall;
		const isOpen = (!isTouchOrSmall && opened.includes(key)) ||
			(isTouchOrSmall && view !== 'libraries' && selectedLibraryKey == key);
		const isSelected = !isTouchOrSmall && selectedLibraryKey === key && itemsSource === 'top';
		const isFetching = !isTouchOrSmall && librariesWithCollectionsFetching.includes(key);
		const collectionsCount = key in collectionCountByLibrary ? collectionCountByLibrary[key] : null;

		return {
			collectionsCount, libraryKey: key, shouldBeTabbableOnTouch, shouldBeTabbable, isOpen, isSelected, isFetching,
			addVirtual, commitAdd, cancelAdd, toggleOpen, virtual,
			...rest,
			...pick(props, ['picked', 'pickerIncludeLibraries', 'onDrillDownNext',
				'onDrillDownPrev', 'onFocusNext', 'onFocusPrev', 'isPickerMode',
				'selectedCollectionKey', 'pickerNavigate', 'pickerPick', 'pickerState' ])
		}
	}

	return (
		<nav className="collection-tree"
			onFocus={ onFocus }
			onBlur={ onBlur }
			tabIndex={ 0 }
			ref={ ref => registerFocusRoot(ref) }
		>
			<div className={ `level-root ${isRootActive ? 'active' : ''}` }>
				<div className="scroll-container-touch" role="tree">
					<section>
						{ myLibraries.length > 0 && (
							<div className={ cx('level', 'level-0') }>
								<ul className="nav" role="group">
									{ myLibraries.map(lib =>
										<LibraryNode key={ lib.key } { ...getNodeProps(lib) } />
									) }
								</ul>
							</div>
						)}
						{ groupLibraries.length > 0 && (
							<React.Fragment>
								<h4>Group Libraries</h4>
								<div className={ cx('level', 'level-0') }>
									<ul className="nav" role="group">
										{ groupLibraries.map(lib =>
											<LibraryNode key={ lib.key } { ...getNodeProps(lib) } />
										) }
									</ul>
								</div>
							</React.Fragment>
						)}
						{ otherLibraries.length > 0 && (
							<React.Fragment>
								<h4>Other Libraries</h4>
								<div className={ cx('level', 'level-0') }>
									<ul className="nav" role="group">
										{ otherLibraries.map(lib =>
											<LibraryNode key={ lib.key } { ...getNodeProps(lib) } />
										) }
									</ul>
								</div>
							</React.Fragment>
						)}
					</section>
				</div>
			</div>
		</nav>
	);
}

Libraries.propTypes = {
	isPickerMode: PropTypes.bool,
	onBlur: PropTypes.func,
	onFocus: PropTypes.func,
	pickerState: PropTypes.object,
	registerFocusRoot: PropTypes.func,
}

export default React.memo(withFocusManager(Libraries));
