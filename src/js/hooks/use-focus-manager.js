import { useEffect, useCallback, useRef, useState } from 'react';

const isModifierKey = ev => ev.getModifierState("Meta") || ev.getModifierState("Alt") ||
		ev.getModifierState("Control") || ev.getModifierState("OS");


const useFocusManager = (ref, { overrideFocusRef = null, isCarousel = true } = {}) => {
	const [isFocused, setIsFocused] = useState(false);
	const lastFocused = useRef(null);
	const originalTabIndex = useRef(null);

	const handleNext = useCallback((ev, { useCurrentTarget = true, targetEnd = null } = {}) => {
		const tabbables = Array.from(
			ref.current.querySelectorAll('[tabIndex="-2"]:not([disabled]):not(.offscreen)')
		).filter(t => t.offsetParent);
		const target = useCurrentTarget ? ev.currentTarget : ev.target;
		const nextIndex = tabbables.findIndex(t => t === target) + 1;
		if(isModifierKey(ev)) {
			// ignore key navigation with modifier keys. See #252
			return;
		}
		ev.preventDefault();
		if(nextIndex < tabbables.length) {
			tabbables[nextIndex].focus();
			lastFocused.current = tabbables[nextIndex];
		} else if (targetEnd !== null) {
			targetEnd.focus();
			lastFocused.current = null;
		} else if(isCarousel) {
			tabbables[0].focus();
			lastFocused.current = tabbables[0];
		}
	});

	const handlePrevious = useCallback((ev, { useCurrentTarget = true, targetEnd = null } = {}) => {
		const tabbables = Array.from(
			ref.current.querySelectorAll('[tabIndex="-2"]:not([disabled]):not(.offscreen)')
		).filter(t => t.offsetParent);
		const target = useCurrentTarget ? ev.currentTarget : ev.target;
		const prevIndex = tabbables.findIndex(t => t === target) - 1;
		if(isModifierKey(ev)) {
			// ignore key navigation with modifier keys. See #252
			return;
		}
		ev.preventDefault();
		if(prevIndex >= 0) {
			tabbables[prevIndex].focus();
			lastFocused.current = tabbables[prevIndex];
		} else if (targetEnd !== null) {
			targetEnd.focus();
			lastFocused.current = null;
		} else if(isCarousel) {
			tabbables[tabbables.length - 1].focus();
			lastFocused.current = tabbables[0];
		}
	});

	const handleDrillDownNext = useCallback(ev => {
		const drillables = Array.from(
			ev.currentTarget.querySelectorAll('[tabIndex="-3"]:not([disabled])')
		).filter(t => t.offsetParent);
		const nextIndex = drillables.findIndex(t => t === ev.target) + 1;
		if(nextIndex < drillables.length) {
			drillables[nextIndex].focus();
		}
	});

	const handleDrillDownPrev = useCallback(ev => {
		const drillables = Array.from(
			ev.currentTarget.querySelectorAll('[tabIndex="-3"]:not([disabled])')
		).filter(t => t.offsetParent);
		const prevIndex = drillables.findIndex(t => t === ev.target) - 1;
		if(prevIndex >= 0) {
			drillables[prevIndex].focus();
		} else {
			ev.currentTarget.focus();
		}
	});

	const handleFocus = useCallback(ev => {
		if(isFocused) {
			return;
		}

		setIsFocused(true);
		ref.current.tabIndex = -1;

		const candidates = Array.from(ref.current.querySelectorAll('[tabIndex="-2"]:not([disabled])'));
		if(lastFocused.current !== null && candidates.includes(lastFocused.current)) {
			lastFocused.current.focus();
		} else if(candidates.length > 0) {
			candidates[0].focus();
		}
	})

	const handleBlur = useCallback(ev => {
		if(ev.relatedTarget &&
			(ev.relatedTarget === ref.current || (
			!ev.relatedTarget.dataFocusRoot && ev.relatedTarget.closest('[data-focus-root]') === ref.current))
		) {
			return;
		}
		setIsFocused(false);
		ev.currentTarget.tabIndex = originalTabIndex.current;
	});


	useEffect(() => {
		if(ref && ref.current) {
			originalTabIndex.current = originalTabIndex.current === null ? ref.current.tabIndex : originalTabIndex.current;
			ref.current.dataset.focusRoot = '';
		}
	}, [ref && ref.current]);

	useEffect(() => {
		if(overrideFocusRef !== null) {
			lastFocused.current = overrideFocusRef.current;
			if(lastFocused.current) {
				lastFocused.current.focus();
			}
		}
	}, [overrideFocusRef && overrideFocusRef.current])

	return { handleNext, handlePrevious, handleDrillDownNext, handleDrillDownPrev, handleFocus, handleBlur };
};

export { useFocusManager };