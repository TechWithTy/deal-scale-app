import type { ChangeEvent, FC } from "react";

interface CardInfoStepProps {
	nameOnCard: string;
	cardNumber: string;
	exp: string;
	cvv: string;
	onNameOnCardChange: (value: string) => void;
	onCardNumberChange: (value: string) => void;
	onExpChange: (value: string) => void;
	onCvvChange: (value: string) => void;
	errors?: Record<string, string>;
}

const CardInfoStep: FC<CardInfoStepProps> = ({
	nameOnCard,
	cardNumber,
	exp,
	cvv,
	onNameOnCardChange,
	onCardNumberChange,
	onExpChange,
	onCvvChange,
	errors = {},
}) => (
	<div className="space-y-4">
		<div>
			<label className="mb-1 block font-medium text-sm" htmlFor="nameOnCard">
				Name on card*
			</label>
			<input
				id="nameOnCard"
				className="block w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				value={nameOnCard}
				onChange={(e) => onNameOnCardChange(e.target.value)}
				placeholder="Olivia Rhye"
			/>
			{errors.nameOnCard && (
				<span className="text-red-500 text-xs">{errors.nameOnCard}</span>
			)}
		</div>
		<div className="grid grid-cols-2 gap-4">
			<div>
				<label className="mb-1 block font-medium text-sm" htmlFor="cardNumber">
					Card Number*
				</label>
				<input
					id="cardNumber"
					className="block w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
					value={cardNumber}
					onChange={(e) => onCardNumberChange(e.target.value)}
					placeholder="1234 5678 9012 3456"
				/>
				{errors.cardNumber && (
					<span className="text-red-500 text-xs">{errors.cardNumber}</span>
				)}
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="mb-1 block font-medium text-sm" htmlFor="exp">
						Exp*
					</label>
					<input
						id="exp"
						className="block w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						value={exp}
						onChange={(e) => onExpChange(e.target.value)}
						placeholder="MM/YY"
					/>
					{errors.exp && (
						<span className="text-red-500 text-xs">{errors.exp}</span>
					)}
				</div>
				<div>
					<label className="mb-1 block font-medium text-sm" htmlFor="cvv">
						CVV*
					</label>
					<input
						id="cvv"
						className="block w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
						value={cvv}
						onChange={(e) => onCvvChange(e.target.value)}
						placeholder="123"
					/>
					{errors.cvv && (
						<span className="text-red-500 text-xs">{errors.cvv}</span>
					)}
				</div>
			</div>
		</div>
	</div>
);

export default CardInfoStep;
