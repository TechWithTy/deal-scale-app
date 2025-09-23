"use client";
import React, { useEffect } from "react";
import { useDrawerFlow } from "../hooks/useDrawerFlow";
import { useDrawerFlowStore } from "../stores/drawerFlowStore";
import type { DrawerFlowProps } from "../types";
import { DrawerPanel } from "./DrawerPanel";
import { HeaderBar } from "./HeaderBar";
import { ControlsBar } from "./ControlsBar";
import { ItemsGrid } from "./ItemsGrid";
import { FooterBar } from "./FooterBar";
import { CreateAddListModal } from "./CreateAddListModal";

export const DrawerFlow: React.FC<DrawerFlowProps> = (props) => {
	const store = useDrawerFlow(props);
	const setListNames = useDrawerFlowStore((s) => s.setListNames);

	// control external open/close if controlled
	useEffect(() => {
		if (typeof props.isOpen === "boolean") {
			useDrawerFlowStore.setState({ isOpen: props.isOpen });
		}
	}, [props.isOpen]);

	const onOpenChange = props.onOpenChange;

	// fetch list names on mount
	useEffect(() => {
		let mounted = true;
		props.listService
			.getListNames()
			.then((names) => {
				if (mounted) setListNames(names);
			})
			.catch(() => setListNames([]));
		return () => {
			mounted = false;
		};
	}, [props.listService, setListNames]);

	// initial load if no items provided
	useEffect(() => {
		if (!props.items || props.items.length === 0) {
			store.loadMore(props.loadMore);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<DrawerPanel onOpenChange={onOpenChange}>
			<HeaderBar titleCount={store.items.length} />
			<ControlsBar
				listSizeCalc={props.listSizeCalc}
				onCreateList={() => useDrawerFlowStore.getState().openModal("create")}
				onAddToList={() => useDrawerFlowStore.getState().openModal("add")}
			/>
			<ItemsGrid renderItem={props.renderItem} />
			<FooterBar loadMore={() => store.loadMore(props.loadMore)} />
			<CreateAddListModal listService={props.listService} />
		</DrawerPanel>
	);
};
