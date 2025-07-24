import type { PropertyDetails } from "@/types/_dashboard/maps";
// * PropertiesList.tsx
// ! Displays the list of properties/leads from search results
import type { FC } from "react";

interface PropertiesListProps {
	properties: PropertyDetails[];
}

const PropertiesList: FC<PropertiesListProps> = ({ properties }) => (
	<div className="mt-6">
		<h2 className="mb-2 font-semibold text-lg">Search Results</h2>
		{properties.length === 0 ? (
			<div className="text-gray-500 text-sm">No properties found.</div>
		) : (
			<ul className="divide-y divide-gray-200 dark:divide-gray-700">
				{properties.map((property) => (
					<li key={property.id} className="py-4">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between">
							<div>
								<div className="font-medium">{property.full_street_line}</div>
								<div className="text-gray-500 text-xs">
									{property.city}, {property.state} {property.zip_code}
								</div>
							</div>
							{/* * Add more property details or actions as needed */}
						</div>
					</li>
				))}
			</ul>
		)}
	</div>
);

export default PropertiesList;
