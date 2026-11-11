import type { Locale } from '../i18n/locales';
import { defaultLocale, isLocale } from '../i18n/locales';
import type { ForumComment, ForumPost } from './forum';
import { forumPosts } from './forum';

type ForumCommentOverlay = {
  body?: string;
  replies?: ForumCommentOverlay[];
};

type ForumPostOverlay = {
  title?: string;
  excerpt?: string;
  body?: string[];
  flair?: string;
  comments?: ForumCommentOverlay[];
};

type ForumLocaleBundle = {
  categories?: Record<string, string>;
  posts?: Record<string, ForumPostOverlay>;
};

const forumLocaleModules = import.meta.glob<{ default: ForumLocaleBundle }>('../i18n/forum/*.json', {
  eager: true,
});

function forumBundleForLocale(locale: Locale | string | undefined): ForumLocaleBundle | undefined {
  const code = locale && isLocale(locale) ? locale : defaultLocale;
  if (code === defaultLocale) return undefined;
  return forumLocaleModules[`../i18n/forum/${code}.json`]?.default;
}

function mergeCommentTree(base: ForumComment[], overlay?: ForumCommentOverlay[]): ForumComment[] {
  if (!overlay?.length) return base;
  return base.map((comment, index) => {
    const patch = overlay[index];
    if (!patch) return comment;
    return {
      ...comment,
      body: patch.body ?? comment.body,
      replies: patch.replies?.length
        ? mergeCommentTree(comment.replies ?? [], patch.replies)
        : comment.replies,
    };
  });
}

function localizePost(post: ForumPost, bundle: ForumLocaleBundle | undefined): ForumPost {
  const patch = bundle?.posts?.[post.slug];
  if (!patch) return post;
  return {
    ...post,
    title: patch.title ?? post.title,
    excerpt: patch.excerpt ?? post.excerpt,
    body: patch.body ?? post.body,
    flair: patch.flair ?? post.flair,
    comments: mergeCommentTree(post.comments, patch.comments),
  };
}

export function getForumPostsForLocale(locale: Locale | string | undefined): ForumPost[] {
  const bundle = forumBundleForLocale(locale);
  if (!bundle) return forumPosts;
  return forumPosts.map((post) => localizePost(post, bundle));
}

export function getForumPostForLocale(slug: string, locale: Locale | string | undefined): ForumPost | undefined {
  const base = forumPosts.find((post) => post.slug === slug);
  if (!base) return undefined;
  const bundle = forumBundleForLocale(locale);
  return localizePost(base, bundle);
}

export function getForumCategoryLabel(
  englishCategory: string,
  locale: Locale | string | undefined,
): string {
  const bundle = forumBundleForLocale(locale);
  return bundle?.categories?.[englishCategory] ?? englishCategory;
}
