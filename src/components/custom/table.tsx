'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExtensionInfo } from '@/interfaces/interface';
import { getExtensions, refreshExtensions } from '@/lib/actions';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

export function ExtensionsTable({
	initialExtensions,
}: {
	initialExtensions: ExtensionInfo[];
}) {
	const [extensions, setExtensions] =
		useState<ExtensionInfo[]>(initialExtensions);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		setError(null);
		try {
			await refreshExtensions();
			const updatedExtensions = await getExtensions();
			setExtensions(updatedExtensions);
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError('An unknown error occurred');
			}
		} finally {
			setIsRefreshing(false);
		}
	};

	return (
		<div>
			<Button
				onClick={handleRefresh}
				disabled={isRefreshing}>
				{isRefreshing ? 'Refreshing...' : 'Refresh Extensions'}
			</Button>
			{error && <div className='text-red-500 mt-2'>{error}</div>}
			<Table>
				<TableCaption>A list of your extensions.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className='w-52'>Name</TableHead>
						<TableHead className='w-[40%]'>Description</TableHead>
						<TableHead>Stars</TableHead>
						<TableHead>Last Updated</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{extensions.map((extension) => (
						<TableRow key={extension.sha}>
							<TableCell>{extension.name}</TableCell>
							<TableCell>{extension.description}</TableCell>
							<TableCell>{extension.stargazers_count}</TableCell>
							<TableCell>
								{new Date(extension.updated_at).toLocaleDateString()}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
