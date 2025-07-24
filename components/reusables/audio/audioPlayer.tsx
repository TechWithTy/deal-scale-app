/**
 * v0 by Vercel.
 * @see https://v0.dev/t/tqTwvyOYlPi
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function Component() {
	return (
		<div className="flex h-screen flex-col items-center justify-center bg-gray-900 text-white">
			<div className="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-lg">
				<div className="mb-4 flex items-center justify-between">
					<div className="font-medium text-lg">Song Title</div>
					<div className="flex items-center space-x-2 text-gray-400">
						<span>3:45</span>
						<span>/</span>
						<span>5:30</span>
					</div>
				</div>
				<div className="mb-6 h-2 w-full rounded-full bg-gray-700">
					<div className="h-2 w-2/3 rounded-full bg-white" />
				</div>
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<Button variant="icon">
							<ArrowLeftIcon className="h-6 w-6" />
						</Button>
						<Button variant="icon">
							<ImagePlayIcon className="h-8 w-8" />
						</Button>
						<Button variant="icon">
							<ArrowRightIcon className="h-6 w-6" />
						</Button>
					</div>
					<div className="flex items-center space-x-2">
						<VolumeIcon className="h-6 w-6 text-gray-400" />
						<Slider defaultValue={[50]} max={100} step={1} className="w-24" />
					</div>
				</div>
			</div>
		</div>
	);
}

function ArrowLeftIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m12 19-7-7 7-7" />
			<path d="M19 12H5" />
		</svg>
	);
}

function ArrowRightIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M5 12h14" />
			<path d="m12 5 7 7-7 7" />
		</svg>
	);
}

function ImagePlayIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m11 16-5 5" />
			<path d="M11 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6.5" />
			<path d="M15.765 22a.5.5 0 0 1-.765-.424V13.38a.5.5 0 0 1 .765-.424l5.878 3.674a1 1 0 0 1 0 1.696z" />
			<circle cx="9" cy="9" r="2" />
		</svg>
	);
}

function PauseIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="14" y="4" width="4" height="16" rx="1" />
			<rect x="6" y="4" width="4" height="16" rx="1" />
		</svg>
	);
}

function VolumeIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
		</svg>
	);
}
