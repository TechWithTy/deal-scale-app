"use client";

import { mentors } from "@/constants/resourcesData";
import type { Mentor } from "@/types/_dashboard/resources";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Calendar, Mail, MessageCircle, Users } from "lucide-react";

export function MentorsSection() {
	const handleContact = (mentor: Mentor) => {
		switch (mentor.contactMethod) {
			case "discord":
				window.open(
					"https://discord.gg/BNrsYRPtFN",
					"_blank",
					"noopener,noreferrer",
				);
				break;
			case "email":
				window.location.href = `mailto:${mentor.contactInfo}`;
				break;
			case "calendar":
				window.open(mentor.contactInfo || "#", "_blank", "noopener,noreferrer");
				break;
		}
	};

	const getAvailabilityColor = (availability: Mentor["availability"]) => {
		const colors: Record<Mentor["availability"], string> = {
			available: "bg-green-500",
			busy: "bg-yellow-500",
			offline: "bg-gray-400",
		};

		return colors[availability];
	};

	const getContactIcon = (contactMethod: Mentor["contactMethod"]) => {
		switch (contactMethod) {
			case "discord":
				return <MessageCircle className="mr-2 h-4 w-4" />;
			case "email":
				return <Mail className="mr-2 h-4 w-4" />;
			case "calendar":
				return <Calendar className="mr-2 h-4 w-4" />;
		}
	};

	const getContactLabel = (contactMethod: Mentor["contactMethod"]) => {
		switch (contactMethod) {
			case "discord":
				return "Message on Discord";
			case "email":
				return "Send Email";
			case "calendar":
				return "Book a Call";
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	return (
		<div className="space-y-6">
			{/* Section Header */}
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
					<Users className="h-5 w-5 text-primary" />
				</div>
				<div>
					<h2 className="font-semibold text-2xl">Investor Mentors</h2>
					<p className="text-muted-foreground text-sm">
						Connect with experienced investors for guidance and support
					</p>
				</div>
			</div>

			{/* Mentors Grid */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{mentors.map((mentor) => (
					<Card
						key={mentor.id}
						className="group transition-all hover:shadow-lg"
					>
						<CardHeader className="p-4 pb-3">
							<div className="mb-3 flex items-start gap-3">
								<div className="relative">
									<Avatar className="h-16 w-16">
										<AvatarImage src={mentor.avatar} alt={mentor.name} />
										<AvatarFallback className="bg-primary/10 font-semibold text-primary text-lg">
											{getInitials(mentor.name)}
										</AvatarFallback>
									</Avatar>
									<div
										className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background ${getAvailabilityColor(
											mentor.availability,
										)}`}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<CardTitle className="line-clamp-1 text-base">
										{mentor.name}
									</CardTitle>
									{mentor.yearsExperience && (
										<p className="text-muted-foreground text-xs">
											{mentor.yearsExperience}+ years experience
										</p>
									)}
								</div>
							</div>
							<div className="flex flex-wrap gap-1">
								{mentor.expertise.slice(0, 3).map((exp, idx) => (
									<Badge
										key={idx}
										variant="outline"
										className="bg-primary/5 text-xs"
									>
										{exp}
									</Badge>
								))}
							</div>
						</CardHeader>
						<CardContent className="p-4 pt-0">
							<CardDescription className="mb-3 line-clamp-3 text-sm">
								{mentor.bio}
							</CardDescription>
							<Button
								onClick={() => handleContact(mentor)}
								className="w-full"
								variant={
									mentor.availability === "available" ? "default" : "outline"
								}
								size="sm"
								disabled={mentor.availability === "offline"}
							>
								{getContactIcon(mentor.contactMethod)}
								{getContactLabel(mentor.contactMethod)}
							</Button>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Mentorship Info */}
			<Card className="border-primary/20 bg-primary/5">
				<CardContent className="flex flex-col items-center gap-4 p-6 text-center md:flex-row md:text-left">
					<div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
						<Users className="h-8 w-8 text-primary" />
					</div>
					<div className="flex-1">
						<h3 className="mb-1 font-semibold text-lg">
							Need Personalized Guidance?
						</h3>
						<p className="text-muted-foreground text-sm">
							Our mentors are here to help you succeed. Book a session to
							discuss your investment goals, review deals, or get expert advice
							on market opportunities.
						</p>
					</div>
					<Button
						onClick={() =>
							window.open("https://discord.gg/BNrsYRPtFN", "_blank")
						}
						className="flex-shrink-0"
					>
						Find a Mentor
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
