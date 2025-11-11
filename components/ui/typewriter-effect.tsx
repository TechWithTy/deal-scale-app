"use client";

import { cn } from "@/lib/utils/index";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { useEffect } from "react";

export const TypewriterEffect = ({
	words,
	className,
	cursorClassName,
}: {
	words: {
		text: string;
		className?: string;
	}[];
	className?: string;
	cursorClassName?: string;
}) => {
	// split text inside of words into array of characters
	const wordsArray = words.map((word, wordIndex) => {
		const letters = word.text.split("").map((char, letterIndex) => ({
			id: `${word.text}-${wordIndex}-${letterIndex}`,
			char,
		}));
		return {
			id: `${word.text}-${wordIndex}`,
			className: word.className,
			letters,
		};
	});

	const [scope, animate] = useAnimate();
	const isInView = useInView(scope);
	useEffect(() => {
		if (isInView) {
			animate(
				"span",
				{
					opacity: 1,
					display: "inline",
				},
				{
					duration: 0.3,
					delay: stagger(0.1),
					ease: "easeInOut",
				},
			);
		}
	}, [animate, isInView]);

	const renderWords = () => {
		return (
			<motion.div ref={scope} className="inline">
				{wordsArray.map((word, wordIndex) => {
					return (
						<span key={word.id} className="inline-block">
							{word.letters.map((letter) => (
								<motion.span
									initial={{}}
									key={letter.id}
									className={cn(
										"hidden whitespace-pre-wrap text-black opacity-0 dark:text-white",
										word.className,
									)}
								>
									{letter.char}
								</motion.span>
							))}
							{wordIndex < wordsArray.length - 1 ? " " : null}
						</span>
					);
				})}
			</motion.div>
		);
	};
	return (
		<div
			className={cn(
				"text-center font-bold text-base sm:text-xl md:text-3xl lg:text-5xl",
				className,
			)}
		>
			{renderWords()}
			<motion.span
				initial={{
					opacity: 0,
				}}
				animate={{
					opacity: 1,
				}}
				transition={{
					duration: 0.8,
					repeat: Number.POSITIVE_INFINITY,
					repeatType: "reverse",
				}}
				className={cn(
					"inline-block h-3 w-[2px] rounded-sm bg-blue-500 md:h-4 md:w-[3px] lg:h-6 lg:w-[3px]",
					cursorClassName,
				)}
			/>
		</div>
	);
};

export const TypewriterEffectSmooth = ({
	words,
	className,
	cursorClassName,
}: {
	words: {
		text: string;
		className?: string;
	}[];
	className?: string;
	cursorClassName?: string;
}) => {
	// split text inside of words into array of characters
	const wordsArray = words.map((word, wordIndex) => {
		const letters = word.text.split("").map((char, letterIndex) => ({
			id: `${word.text}-${wordIndex}-${letterIndex}`,
			char,
		}));
		return {
			id: `${word.text}-${wordIndex}`,
			className: word.className,
			letters,
		};
	});
	const renderWords = () => {
		return (
			<div>
				{wordsArray.map((word) => {
					return (
						<div key={word.id} className="inline-block">
							{word.letters.map((letter) => (
								<span
									key={letter.id}
									className={cn("text-black dark:text-white", word.className)}
								>
									{letter.char}
								</span>
							))}
							&nbsp;
						</div>
					);
				})}
			</div>
		);
	};

	return (
		<div className={cn("my-6 flex space-x-1", className)}>
			<motion.div
				className="overflow-hidden pb-2"
				initial={{
					width: "0%",
				}}
				whileInView={{
					width: "fit-content",
				}}
				transition={{
					duration: 2,
					ease: "linear",
					delay: 1,
				}}
			>
				<div
					className="lg:text:3xl font-bold text-xs sm:text-base md:text-xl xl:text-5xl"
					style={{
						whiteSpace: "nowrap",
					}}
				>
					{renderWords()}{" "}
				</div>{" "}
			</motion.div>
			<motion.span
				initial={{
					opacity: 0,
				}}
				animate={{
					opacity: 1,
				}}
				transition={{
					duration: 0.8,
					repeat: Number.POSITIVE_INFINITY,
					repeatType: "reverse",
				}}
				className={cn(
					"block h-4 w-[4px] rounded-sm bg-blue-500 sm:h-6 xl:h-12",
					cursorClassName,
				)}
			/>
		</div>
	);
};
