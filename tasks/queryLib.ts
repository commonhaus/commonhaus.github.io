
export function runGraphQL(filePath: string, custom: string[] = []): string {
    const args = [
        'api', 'graphql',
        ...custom,
        '-F', "owner=commonhaus",
        '-F', "name=foundation",
        '-F', `query=@${filePath}`,
    ];

    const command = new Deno.Command('gh', { args });

    const { code, stdout, stderr } = command.outputSync();
    const output = new TextDecoder().decode(stdout).trim();
    if (code !== 0) {
        console.log(code, filePath, new TextDecoder().decode(stderr));
        console.log(output);
    }
    return output;
}

export async function queryOpenCollectiveGraphQL(query: string, offset: number): Promise<OCBackerData> {
    const response = await fetch('https://api.opencollective.com/graphql/v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables: {
                offset: offset,
                limit: 100,
                slug: 'commonhaus-foundation',
            },
        })
    });
    console.log(response.status, response.statusText);
    if (!response.ok) {
        throw new Error(`OpenCollective API request failed: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}