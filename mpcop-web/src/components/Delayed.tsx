import { useEffect, useState } from "react";
import { IDelayed } from "../store/models/IDelayed";


/**
 * The delayed component takes another component and display it
 * after the specified duration has elapsed
 * @param props 
 * @returns 
 */
export const Delayed: React.FC<IDelayed> = (props) => {
	const [isShown, setIsShown] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setIsShown(true);
		}, props.waitBeforeShow);
	}, [props.waitBeforeShow]);

	return (isShown ? props.children : null) as React.ReactElement;
};
