// Lead Property Types

export interface PropertyBasicInfo {
	property_url: string;
	property_id: string;
	listing_id: string;
	mls: string;
	mls_id: string;
	status: string;
}

export interface PropertyAddressDetails {
	street: string;
	unit?: string | null;
	city: string;
	state: string;
	zip_code: string;
}

export interface PropertyDescription {
	style: string;
	beds: number;
	full_baths: number;
	half_baths?: number | null;
	sqft?: number | null;
	year_built: number;
	stories: number;
	garage?: number | null;
	lot_sqft?: number | null;
}

export interface PropertyListingDetails {
	days_on_mls: number;
	list_price: number;
	list_price_min?: number | null;
	list_price_max?: number | null;
	list_date: string;
	pending_date?: string | null;
	sold_price?: number | null;
	last_sold_date?: string | null;
	price_per_sqft?: number | null;
	new_construction?: boolean;
	hoa_fee?: number | null;
}

export interface PropertyTaxAssessment {
	building?: number | null;
	land?: number | null;
	total: number;
}

export interface PropertyTaxInfo {
	year: number;
	tax: number;
	assessment: PropertyTaxAssessment;
}

export interface PropertyLocationDetails {
	latitude: number;
	longitude: number;
	nearby_schools?: string | null;
}

export interface PropertyAgentInfo {
	agent_id: string;
	agent_name: string;
	agent_email: string;
	agent_phone: string;
}

export interface PropertyBrokerInfo {
	broker_id: string;
	broker_name: string;
}

export interface PropertyBuilderInfo {
	builder_id: string;
	builder_name: string;
}

export interface PropertyOfficeInfo {
	office_id: string;
	office_name: string;
	office_phones: string[];
	office_email: string;
}

export interface RealtorOnMarketProperty {
	basic: PropertyBasicInfo;
	address: PropertyAddressDetails;
	description: PropertyDescription;
	listing: PropertyListingDetails;
	tax?: PropertyTaxInfo;
	location: PropertyLocationDetails;
	agent: PropertyAgentInfo;
	broker?: PropertyBrokerInfo;
	builder?: PropertyBuilderInfo;
	office?: PropertyOfficeInfo;
}
