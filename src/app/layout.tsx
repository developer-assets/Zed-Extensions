import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from './global/header';
import Footer from './global/footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Zed Extensions',
	description: 'All the extensions for Zed',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<Header />
				{children}
				<Footer />
			</body>
		</html>
	);
}
