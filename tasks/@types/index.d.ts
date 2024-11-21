interface Problem {
    path: string[];
    explanation: string;
}
interface Error {
    message: string;
    extensions?: {
        "value": string;
        "problems": Problem[];
    },
    locations?: {
        line: number;
        column: number;
    }[];
}

// Team / Authors
interface User {
    login: string;
    url: string;
    avatarUrl: string;
    company: string;
    companyHTML: string;
    name: string;
    bio: string;
}
interface TeamData {
    errors?: Error[];
    data: {
        organization: {
            team: {
                members: {
                    nodes: User[];
                };
            };
        };
    };
}
interface InviteData {
    errors?: Error[];
    data: {
        organization: {
            team: {
                invitations: {
                    nodes: Invitee[];
                };
            };
        };
    };
}
interface Invitee {
    invitee: User
}

// Discussion/Pull Request activity data
interface Label {
    name: string;
}
interface Author {
    login: string;
    url: string;
    avatarUrl: string;
    company?: string;
    name?: string;
}
interface ItemWithAuthor {
    id: string;
    title: string;
    number: number;
    author: Author;
    labels: {
        nodes: Label[];
    };
    url: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    closed: boolean;
    closedAt: string;
    locked: boolean;
    activeLockReason: string;
    category?: {
        name: string;
    };
    isAnswered?: boolean;
    answerChosenAt?: string;
}
interface DiscussionsData {
    errors?: Error[];
    data: {
        repository: {
            discussions: {
                nodes: ItemWithAuthor[];
            };
        };
    };
}
interface PullRequestData {
    errors?: Error[];
    data: {
        repository: {
            pullRequests: {
                nodes: ItemWithAuthor[];
            };
        };
    };
}
interface PinnedItem {
    discussion: {
        id: string;
    };
}
interface PinnedItemData {
    errors?: Error[];
    data: {
        repository: {
            pinnedDiscussions: {
                nodes: PinnedItem[];
            };
        };
    };
}
interface PageData {
    author: string;
    content: string;
    date: string;
    github: string;
    number: number;
    rss_title: string;
    tags: string[];
    title: string;
    type: string;
    updated: string;
    url: string;

    answeredAt?: string;
    closedAt?: string;
    description?: string;
    lockReason?: string;
    pinned?: boolean;
}

// Vote result data
interface Item {
    id: string;
    title: string;
    number: number;
    closed: boolean;
    closedAt: string;
    labels: {
        nodes: Label[];
    };
    repository: {
        nameWithOwner: string;
    }
    url: string;
}
interface Result {
    errors?: Error[];
    data?: {
        node: {
            discussion?: Item,
            issue?: Item,
            body: string;
            createdAt: string;
            id: string;
            updatedAt: string;
            url: string;
            author?: {
                login: string;
            }
        };
    };
}
interface VoteRecord {
    login: string;
    url: string;
    createdAt: string;
    reaction: string;
}
interface VoteCategory {
    reactions: string[];
    team: VoteRecord[];
    teamTotal: number;
    total: number;
}
interface VoteData {
    voteType: string;
    hasQuorum: boolean;
    group: string;
    groupSize: number;
    groupVotes: number;
    countedVotes: number;
    droppedVotes: number;
    votingThreshold: string;
    categories?: Record<string, VoteCategory>;
    duplicates: VoteRecord[]
    missingGroupActors: VoteRecord[];
    title?: string;

    // Fields are added (or modified) by this script for rendering
    closed?: boolean;
    closedAt?: string;
    commentId?: string;
    date?: string;
    github?: string;
    ignored?: VoteCategory;
    itemId?: string;
    number?: number;
    repoName?: string;
    sortedCategories?: [string, VoteCategory][];
    tags?: string[];
    type?: string;
    updated?: string;
    url?: string;
}