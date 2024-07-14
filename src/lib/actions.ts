'use server';

import { ExtensionInfo } from '@/interfaces/interface';
import { MongoClient } from 'mongodb';
import axios from 'axios';

const MONGODB_URI = process.env.MONGODB_URI as string;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN as string;

const axiosInstance = axios.create({
	headers: { Authorization: `token ${GITHUB_TOKEN}` },
});

export async function getExtensions(): Promise<ExtensionInfo[]> {
	const client = await MongoClient.connect(MONGODB_URI);
	const db = client.db('zed-extensions');
	const extensionsCollection = db.collection('extensions');

	const extensions = await extensionsCollection.find({}).toArray();

	await client.close();

	return extensions.map((ext) => ({
		sha: ext.sha as string,
		name: ext.name as string,
		repoLink: ext.repoLink as string,
		description: ext.description as string | null,
		stargazers_count: ext.stargazers_count as number,
		updated_at: ext.updated_at as string,
	}));
}

export async function refreshExtensions(): Promise<{ message: string }> {
	try {
		const client = await MongoClient.connect(MONGODB_URI);
		const db = client.db('zed-extensions');
		const extensionsCollection = db.collection('extensions');

		const gitOwner = 'zed-industries';
		const gitRepo = 'extensions';
		const gitPath = 'extensions';
		const gitBranch = 'main';

		const url = `https://api.github.com/repos/${gitOwner}/${gitRepo}/contents/${gitPath}?ref=${gitBranch}`;

		const response = await axiosInstance.get(url);

		console.log(response.data);

		const extensionsData = await Promise.all(
			response.data
				.map(async (item: any) => {
					if (item.html_url) {
						const [, , , owner, repo] = item.html_url.split('/');
						const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
						const repoResponse = await axiosInstance.get(apiUrl);

						return {
							sha: item.sha,
							name: item.name,
							repoLink: item.html_url || '',
							description: repoResponse.data.description,
							stargazers_count: repoResponse.data.stargazers_count,
							updated_at: repoResponse.data.updated_at,
						};
					}
					return null;
				})
				.filter((item: null) => item !== null)
		);

		await extensionsCollection.deleteMany({});
		await extensionsCollection.insertMany(extensionsData);

		await client.close();

		return { message: 'Extensions updated successfully' };
	} catch (error) {
		console.error('Error refreshing extensions:', error);
		throw error;
	}
}
