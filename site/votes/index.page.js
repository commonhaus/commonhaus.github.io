import { path } from "https://deno.land/x/vento@v0.10.0/deps.ts";

function createSVG({ width, height, color, status, progress }) {
    const voteWidth = 46;
    const voteTextX = voteWidth / 2;
    const statusWidth = width - voteWidth;
    const statusTextX = voteWidth + 4;
    const progressBarWidth = statusWidth * progress; // Width of the progress bar
    const linkIndicatorX = width - 3;
    return `
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <style><![CDATA[
        text {
          font-size: 11px;
          font-family: Verdana,DejaVu Sans,Geneva,sans-serif;
        }
        text.shadow {
          fill: #010101;
          fill-opacity: .3;
        }
        text.vote {
            fill: #ffffff; /* Light color for "vote" text */
        }
        text.status {
            fill: #333; /* Dark color for "status" text */
        }
      ]]></style>
      <linearGradient id="smooth" x2="0" y2="100%">
        <stop offset="0" stop-color="#aaa" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <mask id="round">
        <rect width="100%" height="100%" rx="3" fill="#fff"/>
      </mask>
    </defs>
    <g id="bg" mask="url(#round)">
      <rect x="0" width="${voteWidth}" height="${height}" fill="#555"/>
      <rect x="${voteWidth}" width="${statusWidth}" height="${height}" fill="#ddd"/>
      <rect x="${voteWidth}" width="${progressBarWidth}" height="${height}" fill="${color}"/> <!-- Progress bar -->
      <rect width="${width}" height="${height}" fill="url(#smooth)"/>
    </g>
    <g id="fg">
      <text class="high vote" x="${voteTextX}" y="13" text-anchor="middle">🗳️vote</text>
      <text class="high status" x="${statusTextX}" y="13" text-anchor="start">${status}</text>
      <text class="link-indicator" x="${linkIndicatorX}" y="13" text-anchor="end">🔗</text> <!-- Link indicator -->
    </g>
  </svg>
    `;
}

const unknownSvg = createSVG({
    width: 132,
    height: 18,
    color: "#F4F4F4",
    status: 'unknown',
    progress: 1
});

const closedSvg = createSVG({
    width: 132,
    height: 18,
    color: "#CCD1FF",
    status: 'done',
    progress: 1
});

const quorumSvg = createSVG({
    width: 132,
    height: 18,
    color: "#CCFFE0",
    status: 'quorum',
    progress: 1
});

const progressSvg = [
    createSVG({
        width: 132,
        height: 18,
        color: "#FFFACD",
        status: 'in progress',
        progress: 0
    }),
    createSVG({
        width: 132,
        height: 18,
        color: "#FFFACD",
        status: 'in progress',
        progress: .1
    }),
    createSVG({
        width: 132,
        height: 18,
        color: "#FFFACD",
        status: 'in progress',
        progress: .2
    }),
    createSVG({
        width: 132,
        height: 18,
        color: "#FFFACD",
        status: 'in progress',
        progress: .3
    }),
    createSVG({
        width: 132,
        height: 18,
        color: "#FFFACD",
        status: 'in progress',
        progress: .4
    }),
    createSVG({
        width: 132,
        height: 18,
        color: "#FFFACD",
        status: 'in progress',
        progress: .5
    }),
    createSVG({
        width: 132,
        height: 18,
        color: "#FFFACD",
        status: 'in progress',
        progress: .6
    }),
    createSVG({
        width: 132,
        height: 18,
        color: "#FFFACD",
        status: 'in progress',
        progress: .7
    }),
    createSVG({
        width: 132,
        height: 18,
        color: "#FFFACD",
        status: 'in progress',
        progress: .8
    }),
    createSVG({
        width: 132,
        height: 18,
        color: "#FFFACD",
        status: 'in progress',
        progress: .9
    }),
    createSVG({
        width: 132,
        height: 18,
        color: "#FFFACD",
        status: 'all',
        progress: 1
    })
];

function createIndex(pages, dir, uri) {
    const files = Deno.readDirSync(dir);
    for (const file of files) {
        if (file.isDirectory) {
            createIndex(pages, path.join(dir, file.name), path.join(uri, file.name));
        } else if (file.name.endsWith('.json')) {
            const data = JSON.parse(Deno.readTextFileSync(path.join(dir, file.name)));
            data.content = JSON.stringify(data, null, 2);
            data.date = new Date(data.date);
            data.title = `Vote results for ${data.repoName}#${data.number}`;
            data.voteItem = `${data.repoName}#${data.number}`;
            data.updated = new Date(data.updated);
            data.url = `${uri}/${file.name.replace(/\.json$/, '.html')}`;
            data.cssclasses = ['vote-result', data.voteType, 'has-aside'];
            pages.push(data);
        }
    }
}

// Function to round down to the nearest multiple of 10
const roundDownToNearest10 = (num) => Math.floor(num / 10) * 10;

export default function* ({ page }) {
    const genPages = [];
    const dir = path.resolve(import.meta.dirname, '../_generated/votes');

    // recurse to find/generate pages for individual vote results
    createIndex(genPages, dir, "/votes");

    const general = {
        templateEngine: ['vto', 'md'],
        layout: 'layouts/activityVote.vto',
        description: "vote result",
        stylesheets: ['/assets/activity-voting.css'],
        metas: {
            robots: false,
            description: "vote result"
        }
    };

    for (const gp of genPages) {
        // required votes based on supermajority, majority, or all
        // round up: whole human
        const requiredVotes = gp.votingThreshold == 'supermajority'
            ? Math.ceil(gp.groupSize * 2 / 3)
            : gp.votingThreshold == 'majority'
                ? Math.ceil(gp.groupSize / 2)
                : gp.groupSize;

        let suffix = '';
        let svgContent = unknownSvg;
        if (gp.closed) {
            suffix = '?closed';
            svgContent = closedSvg;
        } else if (gp.hasQuorum) {
            suffix = '?quorum';
            svgContent = quorumSvg;
        } else {
            const progress = gp.groupVotes / requiredVotes;
            const roundedProgress = roundDownToNearest10(progress * 100) / 10; // Convert to percentage and round up

            suffix = `?progress=${progress}`;
            svgContent = progressSvg[roundedProgress];
        }

        const newPage = { ...general, ...gp };
        newPage.sortedCategories = newPage.categories ? Object.entries(newPage.categories).sort() : [];
        newPage.voteSvg = newPage.url.replace(/\.html$/,`.svg${suffix}`);
        yield newPage;

        const svg = {
            url: newPage.url.replace(/\.html$/,'.svg'),
            content: svgContent
        }
        yield svg;
    }

    yield {
        url: '/votes/vote-unknown.svg',
        content: unknownSvg
    }

    yield {
        url: '/votes/vote-quorum.svg',
        content: quorumSvg
    }

    yield {
        url: '/votes/vote-closed.svg',
        content: closedSvg
    }

    for (const [index, svg] of progressSvg.entries()) {
        yield {
            url: `/votes/progress-${index}.svg`,
            content: svg
        };
    }

    yield {
        layout: 'layouts/activityVoteArchive.vto',
        title: "Index of Vote results",
        description: "Vote results",
        url: "/votes/index.html",
        cssclasses: ['vote-index'],
        stylesheets: ['/assets/activity-voting.css'],
        metas: {
            robots: false,
            description: "vote index"
        }
    }
}