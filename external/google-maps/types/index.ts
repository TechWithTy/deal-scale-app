export type Coordinates = { lat: number; lng: number };

export type AddressResult = {
	formatted: string;
	placeId?: string;
};

export type MapInit = {
	center: Coordinates;
	zoom?: number;
};

export type Pin = Coordinates & {
	draggable?: boolean;
};

export type OnSave = (data: {
	coords: Coordinates;
	address?: AddressResult;
}) => void;
