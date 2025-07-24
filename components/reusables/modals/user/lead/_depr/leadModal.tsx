import { leadSchema } from "@/types/zod/leadSchema"; // Your schema import
import React, { useState } from "react";

const AddLeadModal = ({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) => {
	// Form state
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [zipCode, setZipCode] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("1");
	const [email, setEmail] = useState("");
	const [facebook, setFacebook] = useState("");
	const [linkedin, setLinkedin] = useState("");
	const [instagram, setInstagram] = useState("");
	const [twitter, setTwitter] = useState("");
	// State for validation errors
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Real-time validation function
	const validateField = (field: string, value: string) => {
		const result = leadSchema.safeParse({
			firstName: field === "firstName" ? value : firstName,
			lastName: field === "lastName" ? value : lastName,
			address: field === "address" ? value : address,
			city: field === "city" ? value : city,
			state: field === "state" ? value : state,
			zipCode: field === "zipCode" ? value : zipCode,
			phoneNumber: field === "phoneNumber" ? value : phoneNumber,
			email: field === "email" ? value : email,
			facebook: field === "facebook" ? value : facebook,
			linkedin: field === "linkedin" ? value : linkedin,
			instagram: field === "instagram" ? value : instagram,
			twitter: field === "twitter" ? value : twitter,
		});

		if (!result.success) {
			const validationErrors: Record<string, string> = {};
			result.error.errors.forEach((error) => {
				validationErrors[error.path[0]] = error.message;
			});
			setErrors(validationErrors);
		} else {
			setErrors((prevErrors) => ({ ...prevErrors, [field]: "" }));
		}
	};

	const handleAddLead = () => {
		const result = leadSchema.safeParse({
			firstName,
			lastName,
			address,
			city,
			state,
			zipCode,
			phoneNumber,
			email,
			facebook,
			linkedin,
			instagram,
			twitter,
		});

		if (!result.success) {
			const validationErrors: Record<string, string> = {};
			result.error.errors.forEach((error) => {
				validationErrors[error.path[0]] = error.message;
			});
			setErrors(validationErrors);
			return;
		}

		// Clear form and errors, then close the modal
		setFirstName("");
		setLastName("");
		setAddress("");
		setCity("");
		setState("");
		setZipCode("");
		setPhoneNumber("1");
		setEmail("");
		setFacebook("");
		setLinkedin("");
		setInstagram("");
		setTwitter("");
		setErrors({});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 dark:bg-opacity-80">
			<div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
				{/* Modal Header */}
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-semibold text-xl dark:text-white">
						Add New Lead
					</h2>
					<button
						onClick={onClose}
						className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
					>
						&times;
					</button>
				</div>
				<div className="mb-4 grid grid-cols-2 gap-4">
					<div>
						<label
							htmlFor="firstName"
							className="block font-medium text-gray-700 text-sm dark:text-gray-300"
						>
							First Name<span className="text-red-500">*</span>
						</label>
						<input
							id="firstName"
							type="text"
							placeholder="Enter first name"
							value={firstName}
							maxLength={50}
							onChange={(e) => {
								setFirstName(e.target.value);
								validateField("firstName", e.target.value);
							}}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
						/>
						{errors.firstName && (
							<p className="text-red-500 text-sm">{errors.firstName}</p>
						)}
					</div>
					<div>
						<label
							htmlFor="lastName"
							className="block font-medium text-gray-700 text-sm dark:text-gray-300"
						>
							Last Name<span className="text-red-500">*</span>
						</label>
						<input
							id="lastName"
							type="text"
							placeholder="Enter last name"
							value={lastName}
							maxLength={50}
							onChange={(e) => {
								setLastName(e.target.value);
								validateField("lastName", e.target.value);
							}}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
						/>
						{errors.lastName && (
							<p className="text-red-500 text-sm">{errors.lastName}</p>
						)}
					</div>
				</div>
				{/* Address Input */}
				<div className="mb-4">
					<label
						htmlFor="address"
						className="block font-medium text-gray-700 text-sm dark:text-gray-300"
					>
						Street<span className="text-red-500">*</span>
					</label>
					<input
						id="address"
						type="text"
						placeholder="Enter an address"
						value={address}
						maxLength={100}
						onChange={(e) => {
							setAddress(e.target.value);
							validateField("address", e.target.value);
						}}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
					/>
					{errors.address && (
						<p className="text-red-500 text-sm">{errors.address}</p>
					)}
				</div>

				<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
					{/* City Input */}
					<div>
						<label
							htmlFor="city"
							className="block font-medium text-gray-700 text-sm dark:text-gray-300"
						>
							City<span className="text-red-500">*</span>
						</label>
						<input
							id="city"
							type="text"
							placeholder="Enter city"
							value={city}
							maxLength={50}
							onChange={(e) => {
								setCity(e.target.value);
								validateField("city", e.target.value);
							}}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
						/>
						{errors.city && (
							<p className="text-red-500 text-sm">{errors.city}</p>
						)}
					</div>

					{/* State Input */}
					<div>
						<label
							htmlFor="state"
							className="block font-medium text-gray-700 text-sm dark:text-gray-300"
						>
							State<span className="text-red-500">*</span>
						</label>
						<input
							id="state"
							type="text"
							placeholder="Enter state"
							value={state}
							maxLength={50}
							onChange={(e) => {
								setState(e.target.value);
								validateField("state", e.target.value);
							}}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
						/>
						{errors.state && (
							<p className="text-red-500 text-sm">{errors.state}</p>
						)}
					</div>
				</div>

				{/* Zip Code Input */}
				<div className="mb-4">
					<label
						htmlFor="zipCode"
						className="block font-medium text-gray-700 text-sm dark:text-gray-300"
					>
						Zip Code<span className="text-red-500">*</span>
					</label>
					<input
						id="zipCode"
						type="text"
						placeholder="Enter zip code"
						value={zipCode}
						maxLength={10}
						onChange={(e) => {
							setZipCode(e.target.value);
							validateField("zipCode", e.target.value);
						}}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
					/>
					{errors.zipCode && (
						<p className="text-red-500 text-sm">{errors.zipCode}</p>
					)}
				</div>

				{/* Phone Number and Email Fields (same as before) */}
				<div className="mb-4">
					<label
						htmlFor="phoneNumber"
						className="block font-medium text-gray-700 text-sm dark:text-gray-300"
					>
						Phone Number<span className="text-red-500">*</span>
					</label>
					<input
						id="phoneNumber"
						type="text"
						placeholder="Enter the phone number"
						value={phoneNumber}
						maxLength={15}
						onChange={(e) => {
							setPhoneNumber(e.target.value);
							validateField("phoneNumber", e.target.value);
						}}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
					/>
					{errors.phoneNumber && (
						<p className="text-red-500 text-sm">{errors.phoneNumber}</p>
					)}
				</div>

				<div className="mb-4">
					<label
						htmlFor="email"
						className="block font-medium text-gray-700 text-sm dark:text-gray-300"
					>
						Email<span className="text-red-500">*</span>
					</label>
					<input
						id="email"
						type="email"
						placeholder="Enter email address"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							validateField("email", e.target.value);
						}}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
					/>
					{errors.email && (
						<p className="text-red-500 text-sm">{errors.email}</p>
					)}
				</div>
				<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
					{/* Facebook Input */}
					<div>
						<label
							htmlFor="facebook"
							className="block font-medium text-gray-700 text-sm dark:text-gray-300"
						>
							Facebook
						</label>
						<input
							id="facebook"
							type="url"
							placeholder="Enter Facebook profile URL"
							value={facebook}
							onChange={(e) => {
								setFacebook(e.target.value);
								validateField("facebook", e.target.value);
							}}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
						/>
						{errors.facebook && (
							<p className="text-red-500 text-sm">{errors.facebook}</p>
						)}
					</div>

					{/* LinkedIn Input */}
					<div>
						<label
							htmlFor="linkedin"
							className="block font-medium text-gray-700 text-sm dark:text-gray-300"
						>
							LinkedIn
						</label>
						<input
							id="linkedin"
							type="url"
							placeholder="Enter LinkedIn profile URL"
							value={linkedin}
							onChange={(e) => {
								setLinkedin(e.target.value);
								validateField("linkedin", e.target.value);
							}}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
						/>
						{errors.linkedin && (
							<p className="text-red-500 text-sm">{errors.linkedin}</p>
						)}
					</div>

					{/* Instagram Input */}
					<div>
						<label
							htmlFor="instagram"
							className="block font-medium text-gray-700 text-sm dark:text-gray-300"
						>
							Instagram
						</label>
						<input
							id="instagram"
							type="url"
							placeholder="Enter Instagram profile URL"
							value={instagram}
							onChange={(e) => {
								setInstagram(e.target.value);
								validateField("instagram", e.target.value);
							}}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
						/>
						{errors.instagram && (
							<p className="text-red-500 text-sm">{errors.instagram}</p>
						)}
					</div>

					{/* Twitter Input */}
					<div>
						<label
							htmlFor="twitter"
							className="block font-medium text-gray-700 text-sm dark:text-gray-300"
						>
							Twitter
						</label>
						<input
							id="twitter"
							type="url"
							placeholder="Enter Twitter profile URL"
							value={twitter}
							onChange={(e) => {
								setTwitter(e.target.value);
								validateField("twitter", e.target.value);
							}}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500"
						/>
						{errors.twitter && (
							<p className="text-red-500 text-sm">{errors.twitter}</p>
						)}
					</div>
				</div>

				{/* Add Lead Button */}
				<div className="flex justify-end">
					<button
						onClick={handleAddLead}
						className="rounded-md bg-blue-600 px-4 py-2 text-white transition duration-200 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
					>
						Add Lead
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddLeadModal;
