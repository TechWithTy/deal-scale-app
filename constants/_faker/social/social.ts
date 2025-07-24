import { faker } from "@faker-js/faker";

import { APP_TESTING_MODE } from "@/constants/data";
import type {
	BaseAction,
	InstagramAction,
	LinkedInAction,
	SocialAction,
	TwitterAction,
} from "@/types/_dashboard/campaign";

// Helper function to generate base action data
const generateBaseAction = (): Omit<
	BaseAction,
	"replyMessage" | "viewLink"
> => {
	const attempts = faker.number.int({ min: 1, max: 5 });
	const successful = faker.number.int({ min: 0, max: attempts });
	const failed = attempts - successful;

	return {
		status: faker.helpers.arrayElement(["pending", "successful", "failed"]),
		attempt: attempts,
		successful: successful,
		failed: failed,
	};
};

// Generate a Twitter-specific action
export const generateTwitterAction = (): TwitterAction => ({
	...generateBaseAction(),
	type: faker.helpers.arrayElement([
		"Like",
		"Follow",
		"Retweet",
		"📩 Followers",
	]),
	replyMessage: faker.helpers.arrayElement([faker.lorem.sentence(), undefined]),
	viewLink: faker.internet.url(),
});

// Generate a LinkedIn-specific action
export const generateLinkedInAction = (): LinkedInAction => ({
	...generateBaseAction(),
	type: faker.helpers.arrayElement([
		"Connect",
		"Connect & Follow Up",
		"Message",
		"Invite to Follow",
		"Comment",
		"Like",
		"📩 Connections",
		"📩 Groups",
	]),
	replyMessage: faker.helpers.arrayElement([faker.lorem.sentence(), undefined]),
	viewLink: faker.internet.url(),
});

// Generate an Instagram-specific action
export const generateInstagramAction = (): InstagramAction => ({
	...generateBaseAction(),
	type: faker.helpers.arrayElement(["Like", "Follow", "Comment", "👁️ Story"]),
	viewLink: faker.internet.url(),
});

// Generate a random action (Twitter, LinkedIn, or Instagram)
export const generateRandomAction = (): SocialAction => {
	const platform = faker.helpers.arrayElement([
		"Twitter",
		"LinkedIn",
		"Instagram",
	]);

	if (platform === "Twitter") {
		return generateTwitterAction();
	}
	if (platform === "LinkedIn") {
		return generateLinkedInAction();
	}
	return generateInstagramAction();
};

// Generate an array of actions
export const generateActions = (count = 100): SocialAction[] => {
	return Array.from({ length: count }, generateRandomAction);
};

export const mockSocialActions = APP_TESTING_MODE && generateActions();
