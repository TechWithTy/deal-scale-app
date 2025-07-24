"use client";

import Image from "next/image";
import { useState } from "react";

interface AgentAvatarProps {
	src: string | null | undefined;
	alt: string;
	size?: number;
}

// * A reusable component to display an agent's avatar with a fallback placeholder.
// ? It handles image loading errors gracefully to prevent broken image icons.
export function AgentAvatar({ src, alt, size = 40 }: AgentAvatarProps) {
	const [error, setError] = useState(false);

	const handleError = () => {
		setError(true);
	};

	if (!src || error) {
		return (
			<div
				className="rounded-full bg-gradient-to-br from-gray-200 to-gray-400"
				style={{ width: size, height: size }}
			/>
		);
	}

	return (
		<Image
			src={src}
			alt={alt}
			width={size}
			height={size}
			className="rounded-full"
			onError={handleError}
		/>
	);
}
