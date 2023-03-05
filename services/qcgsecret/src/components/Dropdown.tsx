import '../styles/Dropdown.css';
import { BsArrowDownLeft } from '@react-icons/all-files/bs/BsArrowDownLeft';
import { BsArrowUpLeft } from '@react-icons/all-files/bs/BsArrowUpLeft';
import { Disclosure, DisclosureContent, useDisclosureState } from 'ariakit/disclosure';
import type { PropsWithChildren } from 'react';

export type IDropdown = {
	title: string;
};

export default function Dropdown({ title, children }: PropsWithChildren<IDropdown>) {
	const disclosure = useDisclosureState();
	const icon = disclosure.open ? (
		<BsArrowUpLeft color="white" size={20} />
	) : (
		<BsArrowDownLeft color="white" size={20} />
	);

	return (
		<div className="ext">
			<div className="wrapper">
				<Disclosure className="button" state={disclosure}>
					<div className="button-container">
						<span className="button-text">{title}</span>
						<span className="icon">{icon}</span>
					</div>
				</Disclosure>
				<DisclosureContent className="content" state={disclosure}>
					<p>{children}</p>
				</DisclosureContent>
			</div>
		</div>
	);
}
