import { useEffect, useState } from "react";

interface IDelayed {
	children: React.ReactNode;
	waitBeforeShow: number;
}

export const Delayed: React.FC<IDelayed> = (props) => {
	const [isShown, setIsShown] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setIsShown(true);
		}, props.waitBeforeShow);
	}, [props.waitBeforeShow]);

	return (isShown ? props.children : null) as React.ReactElement;
};
