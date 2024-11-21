
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