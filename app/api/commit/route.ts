import { NextResponse } from 'next/server';
import axios from 'axios';

export const POST = async (): Promise<NextResponse> => {
  const { GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_BRANCH } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME || !GITHUB_BRANCH) {
    return NextResponse.json(
      { success: false, error: 'Environment variables are not set properly.' },
      { status: 500 }
    );
  }

  const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  try {
    // Fetch the README file from the repository
    const { data: fileData } = await githubApi.get(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/README.md`,
      { params: { ref: GITHUB_BRANCH } }
    );

    const currentContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const updatedContent = `${currentContent}\nUpdated at ${new Date().toISOString()}`;

    // Commit the changes to README.md
    const { data } = await githubApi.put(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/README.md`,
      {
        message: 'Auto-update via Next.js App Router',
        content: Buffer.from(updatedContent).toString('base64'),
        sha: fileData.sha,
        branch: GITHUB_BRANCH,
      }
    );

    return NextResponse.json({ success: true, commitUrl: data.commit.html_url });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to update the repository' },
      { status: 500 }
    );
  }
};
