'use client';

import React, { useState, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, Github } from 'lucide-react';

export function ExtensionsTable({
	initialExtensions,
}: {
	initialExtensions: ExtensionInfo[];
}) {
	const [extensions, setExtensions] =
		useState<ExtensionInfo[]>(initialExtensions);
	const [filteredExtensions, setFilteredExtensions] =
		useState<ExtensionInfo[]>(initialExtensions);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [buttonText, setButtonText] = useState<string>('Refresh');
	const [itemsPerPage, setItemsPerPage] = useState<number>(10);
	const [sortOrder, setSortOrder] = useState<string>('normal');

	const handleRefresh = async () => {
		setIsRefreshing(true);
		setButtonText('Refreshing...');
		try {
			await refreshExtensions();
			const updatedExtensions = await getExtensions();
			setExtensions(updatedExtensions);
			setFilteredExtensions(updatedExtensions);

			setButtonText('Done');
			setTimeout(() => {
				setButtonText('Refresh');
				setIsRefreshing(false);
				setDialogOpen(false);
			}, 500);
		} catch (error) {
			console.log(error);
			setButtonText('Failed');
			setTimeout(() => {
				setButtonText('Refresh');
				setIsRefreshing(false);
				setDialogOpen(false);
			}, 500);
		}
	};

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		const query = event.target.value;
		setSearchQuery(query);
		setCurrentPage(1);

		const temp = extensions.filter(
			(extension) =>
				extension.name?.toLowerCase().includes(query.toLowerCase()) ||
				extension.description?.toLowerCase().includes(query.toLowerCase())
		);

		setFilteredExtensions(temp);
	};

	const handleSortChange = (value: string) => {
		setSortOrder(value);
		let sortedExtensions = [...filteredExtensions];
		if (value === 'ascending') {
			sortedExtensions.sort((a, b) => a.stargazers_count - b.stargazers_count);
		} else if (value === 'descending') {
			sortedExtensions.sort((a, b) => b.stargazers_count - a.stargazers_count);
		} else if (value === 'newest') {
			sortedExtensions.sort(
				(a, b) =>
					new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
			);
		} else if (value === 'oldest') {
			sortedExtensions.sort(
				(a, b) =>
					new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
			);
		} else if (value === 'normal') {
			sortedExtensions = extensions;
		}
		setFilteredExtensions(sortedExtensions);
	};

	const totalItems = filteredExtensions.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const currentItems = filteredExtensions.slice(
		startIndex,
		startIndex + itemsPerPage
	);

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	return (
		<div className='mb-32'>
			<div className='flex flex-col sm:flex-row items-center justify-between gap-3 mb-4'>
				<div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
					<Input
						type='text'
						placeholder='Search by name or description'
						className='w-72'
						value={searchQuery}
						onChange={handleSearchChange}
					/>
					<div className='flex items-center justify-center gap-3'>
						<Select onValueChange={handleSortChange}>
							<SelectTrigger className='w-32'>
								<SelectValue placeholder='Sort by stars' />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value='normal'>Normal</SelectItem>
									<SelectItem value='ascending'>Ascending</SelectItem>
									<SelectItem value='descending'>Descending</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select onValueChange={handleSortChange}>
							<SelectTrigger className='w-32'>
								<SelectValue placeholder='Sort by date' />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value='normal'>Normal</SelectItem>
									<SelectItem value='newest'>Newest</SelectItem>
									<SelectItem value='oldest'>Oldest</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
				<Dialog
					open={dialogOpen}
					onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button
							onClick={() => setDialogOpen(true)}
							className='w-44'>
							{buttonText}
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Refresh Extensions</DialogTitle>
							<DialogDescription className='mt-2'>
								Before you refresh, there are currently {extensions.length}{' '}
								extensions.
								<br />
								Hitting refresh will make {extensions.length + 3} API calls.
								<br />
								Extensions are <strong>NOT</strong> updated daily,{' '}
								<strong>NOT</strong> even weekly.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter className='mt-2'>
							<Button
								onClick={handleRefresh}
								disabled={isRefreshing}
								className='w-44'>
								{buttonText}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
			<Table className='border border-input mt-1 w-full'>
				<TableCaption>List of Zed extensions.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className='w-10'></TableHead>
						<TableHead className='w-52'>Name</TableHead>
						<TableHead className='w-[40%]'>Description</TableHead>
						<TableHead>Stars</TableHead>
						<TableHead>Last Updated</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{currentItems.map((extension) => (
						<TableRow key={extension.sha}>
							<TableCell>
								<a
									href={extension.repoLink || '/'}
									target='_blank'>
									<Github />
								</a>
							</TableCell>
							<TableCell>{extension.name}</TableCell>
							<TableCell>{extension.description}</TableCell>
							<TableCell>{extension.stargazers_count}</TableCell>
							<TableCell className='tabular-nums'>
								{(() => {
									const date = new Date(extension.updated_at);
									const options: Intl.DateTimeFormatOptions = {
										month: 'short',
										day: '2-digit',
										year: 'numeric',
									};
									return date.toLocaleDateString('en-US', options);
								})()}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className='mt-1 flex flex-col sm:flex-row items-center justify-between gap-3'>
				<div></div>
				<div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
					<div className='flex items-center gap-3'>
						<p>Rows per page</p>
						<Select onValueChange={(value) => setItemsPerPage(Number(value))}>
							<SelectTrigger className='w-20'>
								<SelectValue placeholder={itemsPerPage} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value='10'>10</SelectItem>
									<SelectItem value='20'>20</SelectItem>
									<SelectItem value='30'>30</SelectItem>
									<SelectItem value='40'>40</SelectItem>
									<SelectItem value='50'>50</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className='flex items-center gap-3'>
						<p>
							Page {currentPage} of {totalPages}
						</p>
						<Button
							className='p-1'
							variant='outline'
							disabled={currentPage === 1}
							onClick={() => handlePageChange(currentPage - 1)}>
							<ChevronLeft />
						</Button>
						<Button
							className='p-1'
							variant='outline'
							disabled={currentPage === totalPages}
							onClick={() => handlePageChange(currentPage + 1)}>
							<ChevronLeft className='rotate-180' />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
