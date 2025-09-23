"use client";

import type { FC } from "react";
import PrizeWheelCore, {
	type PrizeWheelProps,
} from "./internal/PrizeWheelCore";

export type { PrizeWheelProps };

const PrizeWheelInner: FC<PrizeWheelProps> = (props) => (
	<PrizeWheelCore {...props} />
);

export default PrizeWheelInner;
