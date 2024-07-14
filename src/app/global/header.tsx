import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
	return (
		<header className='w-full container max-w-7xl mx-auto px-2 py-8'>
			<Link
				href='/'
				className='flex items-center gap-2'>
				<Image
					src='/logo.png'
					alt='Zed extensions logo'
					height={40}
					width={40}
					priority={true}
				/>
				<h2 className='flex flex-col text-sm text-primary font-semibold'>
					<span>ZED</span>
					<span>EXTENSIONS</span>
				</h2>
			</Link>
		</header>
	);
}
