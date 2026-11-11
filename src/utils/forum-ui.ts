import type { Translations } from '../i18n/types';

export type ForumUi = {
  eyebrow: string;
  title: string;
  subtitle: string;
  breadcrumb: string;
  exploreGuides: string;
  sortPopular: string;
  sortLatest: string;
  sortTop: string;
  searchPlaceholder: string;
  searchAria: string;
  sortAria: string;
  postsAria: string;
  filterAria: string;
  allTopics: string;
  discussionOne: string;
  discussionMany: string;
  comments: string;
  readDiscussion: string;
  fromGuide: string;
  basedOn: string;
  readGuide: string;
  emptyFilter: string;
  paginationAria: string;
  previous: string;
  next: string;
  sidebarAboutTitle: string;
  sidebarAboutCopy: string;
  sidebarTopics: string;
  sidebarExploreGuides: string;
  sidebarCommunities: string;
  sidebarBrowseQa: string;
  sidebarBrowseAll: string;
  sidebarGuidelines: string;
  guideline1: string;
  guideline2: string;
  guideline3: string;
  sidebarReadGuidelines: string;
  sidebarFootAbout: string;
  voteAria: string;
  upvoteAria: string;
  downvoteUnavailable: string;
  showingRange: string;
  zeroDiscussions: string;
  developerFlair: string;
  points: string;
  previewDiscussion: string;
  postingUnavailable: string;
  commentsTitle: string;
  commentsSubtitle: string;
  detailInTopic: string;
  detailBrowse: string;
  detailMoreTitle: string;
  detailViewAll: string;
  colThread: string;
  colReplies: string;
  replyOne: string;
  colVotes: string;
  colLastReply: string;
  closedThread: string;
  noRepliesYet: string;
};

const defaults: ForumUi = {
  eyebrow: 'Community',
  title: 'Rust community forum',
  subtitle: 'Setup, aim, ESP, and plan questions with marked developer replies.',
  breadcrumb: 'Forum',
  exploreGuides: 'Explore the guides',
  sortPopular: 'Popular',
  sortLatest: 'Latest',
  sortTop: 'Most discussed',
  searchPlaceholder: 'Search discussions ✨',
  searchAria: 'Search discussions',
  sortAria: 'Post sorting',
  postsAria: 'Community posts',
  filterAria: 'Filter discussions by topic',
  allTopics: 'All topics',
  discussionOne: 'discussion',
  discussionMany: 'discussions',
  comments: 'comments',
  readDiscussion: 'Read discussion',
  fromGuide: 'From the guide:',
  basedOn: 'Based on:',
  readGuide: 'Read the guide',
  emptyFilter: 'No discussions match. Try another search or topic.',
  paginationAria: 'Discussion pages',
  previous: 'Previous',
  next: 'Next',
  sidebarAboutTitle: 'Rust community',
  sidebarAboutCopy:
    'Questions about the hack, the HWID spoofer, and UGC recovery. Developer replies stay on the thread.',
  sidebarTopics: 'topics',
  sidebarExploreGuides: 'Explore all guides',
  sidebarCommunities: 'Communities',
  sidebarBrowseQa: 'Browse related threads',
  sidebarBrowseAll: 'Browse all communities',
  sidebarGuidelines: 'Community guidelines',
  guideline1: 'Keep it friendly and constructive',
  guideline2: 'Stay on topic and add context',
  guideline3: 'Mark spoilers and sensitive content',
  sidebarReadGuidelines: 'Read the full guidelines',
  sidebarFootAbout: 'About · Guidelines · Privacy · Terms',
  voteAria: 'Discussion voting',
  upvoteAria: 'Upvote this discussion',
  downvoteUnavailable: 'Downvoting is unavailable',
  showingRange: 'Showing {from}–{to} of {total}',
  zeroDiscussions: '0 discussions',
  developerFlair: 'Developer',
  points: 'points',
  previewDiscussion: 'Preview discussion',
  postingUnavailable: 'Posting and voting are unavailable here',
  commentsTitle: 'Comments',
  commentsSubtitle: 'Developer replies are marked',
  detailInTopic: 'in this topic',
  detailBrowse: 'Browse discussions',
  detailMoreTitle: 'More discussions',
  detailViewAll: 'View all discussions',
  colThread: 'Thread',
  colReplies: 'Replies',
  replyOne: 'Reply',
  colVotes: 'Votes',
  colLastReply: 'Last reply',
  closedThread: 'Closed',
  noRepliesYet: 'No replies yet 👀',
};

export function getForumUi(t: Translations): ForumUi {
  const raw = t.forum as Partial<ForumUi> | undefined;
  return { ...defaults, ...raw };
}
