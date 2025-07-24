const baseUrl = "https://services.leadconnectorhq.com/workflows/";

const headers = (accessToken: string) => ({
	Authorization: `Bearer ${accessToken}`,
	Accept: "application/json",
	Version: "2021-07-28",
});

async function getWorkflows(accessToken: string, locationId: string) {
	const url = `${baseUrl}?locationId=${locationId}`;

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: headers(accessToken),
		});

		// Check if the response is not OK (status 200-299)
		if (!response.ok) {
			const errorText = await response.text(); // Extract error message from response
			throw new Error(
				`Error fetching workflows: ${response.status} - ${errorText}`,
			);
		}

		// Parse the JSON response
		const data = await response.json();

		// Return the workflows data
		return data.workflows;
	} catch (error) {
		// Log or handle the error as necessary
		throw new Error(
			`Failed to fetch workflows: ${
				error instanceof Error ? error.message : "Unknown error"
			}`,
		);
	}
}

export { getWorkflows };
