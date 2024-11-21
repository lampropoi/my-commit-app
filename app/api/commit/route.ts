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
    // Step 1: Generate the markdown file name and content
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `markdown_${timestamp}.md`;
    const filePath = `app/documents/${fileName}`;
    const fileContent = `# Hello World\n\nThis file was created at ${timestamp}.`;

    // Step 2: Encode the content to Base64 for GitHub API
    const encodedContent = Buffer.from(fileContent).toString('base64');

    // Step 3: Commit the file to the repository
    const { data } = await githubApi.put(
      `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${filePath}`,
      {
        message: `Create ${fileName} with Hello World content`,
        content: encodedContent,
        branch: GITHUB_BRANCH,
      }
    );

    return NextResponse.json({ success: true, commitUrl: data.commit.html_url });
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error(error.response?.data || error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to create or commit the markdown file.' },
      { status: 500 }
    );
  }
};
