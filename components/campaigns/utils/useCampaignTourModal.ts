"use client";

import * as React from "react";

export function useCampaignTourModal(openCampaignModal: () => void) {
	React.useEffect(() => {
		const handleOpenCampaignModal = () => openCampaignModal();

		window.addEventListener(
			"tour-open-campaign-create-modal",
			handleOpenCampaignModal,
		);

		return () => {
			window.removeEventListener(
				"tour-open-campaign-create-modal",
				handleOpenCampaignModal,
			);
		};
	}, [openCampaignModal]);
}
