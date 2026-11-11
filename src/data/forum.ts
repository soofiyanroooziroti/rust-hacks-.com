export interface ForumComment {
  author: string;
  age: string;
  score: number;
  body: string;
  developer?: boolean;
  replies?: ForumComment[];
}

export interface ForumPost {
  slug: string;
  category: string;
  categoryTone: 'purple' | 'blue' | 'green' | 'orange';
  title: string;
  excerpt: string;
  /** Meta description. Cards keep the shorter excerpt. */
  description: string;
  author: string;
  age: string;
  date: string;
  commentsCount: number;
  upvotes: number;
  flair?: string;
  body: string[];
  comments: ForumComment[];
  sourceTitle?: string;
  sourcePath?: string;
  /** Answered threads that should show a closed badge. New patch threads stay open. */
  closed?: boolean;
}

export const FORUM_DEVELOPER = 'RustHacksDev';

export const forumCategories = [
  { name: 'General', tone: 'purple', icon: 'users' },
  { name: 'Guides & Builds', tone: 'blue', icon: 'navBlog' },
  { name: 'Patch Talk', tone: 'orange', icon: 'refresh' },
  { name: 'Community', tone: 'green', icon: 'messageCircle' },
] as const;

/** Stable filter keys — always derived from English category names. */
export const FORUM_CATEGORY_KEYS: Record<string, string> = {
  General: 'general',
  'Guides & Builds': 'guidesbuilds',
  'Patch Talk': 'patchtalk',
  Community: 'community',
};

export function forumCategoryFilterKey(category: string): string {
  return FORUM_CATEGORY_KEYS[category] ?? category.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function countComments(comments: ForumComment[]): number {
  return comments.reduce(
    (total, comment) => total + 1 + (comment.replies ? countComments(comment.replies) : 0),
    0,
  );
}

function withCounts(post: Omit<ForumPost, 'commentsCount'>): ForumPost {
  return { ...post, commentsCount: countComments(post.comments) };
}

export function forumLastReply(comments: ForumComment[]): { author: string; age: string } | null {
  let last: ForumComment | null = null;
  const walk = (list: ForumComment[]) => {
    for (const comment of list) {
      last = comment;
      if (comment.replies?.length) walk(comment.replies);
    }
  };
  walk(comments);
  return last ? { author: last.author, age: last.age } : null;
}

/** Seeded discussions — English source. Dates run 10 Oct 2026 through 12 Nov 2026. */
const rawPosts: Array<Omit<ForumPost, 'commentsCount'>> = [
  {
    slug: 'loader-wont-open-after-patch',
    category: 'Patch Talk',
    categoryTone: 'orange',
    title: 'Loader just spins after the patch wtf',
    excerpt: 'Was fine yesterday. Today the loader sits there. Old file or am I cooked?',
    description:
      'Loader would not open after a Rust patch. Staff said the old file was stale, the key was fine, and the new portal file opened.',
    author: 'sulfur_rat',
    age: '5w ago',
    date: 'Oct 10, 2026',
    upvotes: 46,
    flair: 'Solved',
    closed: true,
    body: [
      'yo the patch dropped and my loader just spins. was working last night. i did not touch secure boot or tpm.',
      'status still looked like the old note. am i cooked or do i wait?? 😭',
    ],
    comments: [
      {
        author: 'RustHacksDev',
        age: '5w ago',
        score: 31,
        developer: true,
        body: 'That note was for the previous client. If status is not green for this build, do not keep launching. When it is green, grab the new file from the same portal order. Same key. Leave HVCI, TPM, and secure boot on.',
        replies: [
          {
            author: 'sulfur_rat',
            age: '5w ago',
            score: 12,
            body: 'new file was up. opened clean. W thank you 🔥',
          },
          {
            author: 'hemp_runner',
            age: '5w ago',
            score: 8,
            body: 'same loop here. portal file fixed it. the key was never the problem fr',
          },
        ],
      },
      {
        author: 'oilrig_lex',
        age: '5w ago',
        score: 6,
        body: 'i kept clicking the exe in downloads like a clown. that copy was stale 💀',
      },
      {
        author: 'sam_site_sam',
        age: '4w ago',
        score: 4,
        body: 'status first, then portal. that order actually helped.',
        replies: [
          {
            author: 'berry_bus',
            age: '4w ago',
            score: 3,
            body: 'this. i stopped guessing and it launched.',
          },
        ],
      },
      {
        author: 'tc_grief',
        age: '4w ago',
        score: 2,
        body: 'ngl i thought my windows update broke it. it was just the old file.',
      },
      {
        author: 'night_farm_eli',
        age: '4w ago',
        score: 5,
        body: 'helped. green note + new file = it opens. do not force a red one.',
      },
    ],
    sourceTitle: 'Rust Hack Download: Setup Guide and How to Use It',
    sourcePath: '/blog/rust-hack-download/',
  },
  {
    slug: 'do-i-turn-secure-boot-off',
    category: 'General',
    categoryTone: 'purple',
    title: 'Do I turn Secure Boot off??',
    excerpt: 'Some random said disable TPM so the loader opens. That feels wrong.',
    description:
      'A player was told to disable Secure Boot and TPM. Staff said leave both on. The loader is meant to run with them enabled.',
    author: 'kayla_nodes',
    age: '4w ago',
    date: 'Oct 16, 2026',
    upvotes: 58,
    flair: 'Solved',
    closed: true,
    body: [
      'servers want secure boot and tpm 2.0 now. a dude in chat said turn them off or the menu will not inject. wtf.',
      'requirements on the product page say leave them ON. which one is real?',
    ],
    comments: [
      {
        author: 'RustHacksDev',
        age: '4w ago',
        score: 40,
        developer: true,
        body: 'Leave them on. Windows 10 or 11, HVCI, core isolation, TPM, and secure boot stay enabled. We do not tell you to turn those off. If the label is red, wait. If it is blue, developers are still on it. If it is green, use the current portal file.',
        replies: [
          {
            author: 'kayla_nodes',
            age: '4w ago',
            score: 11,
            body: 'left them on. green file opened. bet 🙏',
          },
        ],
      },
      {
        author: 'bow_kid',
        age: '4w ago',
        score: 9,
        body: 'the “turn tpm off” tip is how people brick the boot. do not. this thread helped.',
      },
      {
        author: 'jake_launchsite',
        age: '3w ago',
        score: 4,
        body: 'older pc here and the check is annoying but i still left secure boot on. loader was fine once status was green.',
      },
      {
        author: 'night_farm_eli',
        age: '3w ago',
        score: 3,
        body: 'W answer. screenshot this for the next guy who says disable it.',
      },
    ],
    sourceTitle: 'Rust Hack Features: Customize Your Interface with Config Options',
    sourcePath: '/blog/rust-hack-features/',
  },
  {
    slug: 'esp-ate-the-whole-screen',
    category: 'Guides & Builds',
    categoryTone: 'blue',
    title: 'ESP ate my whole screen lol',
    excerpt: 'Players, ores, hemp, traps, all on. I cannot see the door.',
    description:
      'Every visual was on and the overlay was unreadable. A short player preset plus a separate farm config fixed it.',
    author: 'monument_mike',
    age: '3w ago',
    date: 'Oct 21, 2026',
    upvotes: 39,
    flair: 'Solved',
    closed: true,
    body: [
      'turned on players, boxes, names, sulfur, metal, stone, hemp, berries, turrets, dropped guns. looked cool for 2 seconds.',
      'now a monument fight is just words. what do you actually leave on?? i am lost ngl 😭',
    ],
    comments: [
      {
        author: 'RustHacksDev',
        age: '3w ago',
        score: 27,
        developer: true,
        body: 'Two configs. Fight: players, box or skeleton, name, health. Farm: ores and the nodes you care about, traps if you are roaming. Do not run both at once. Drop the distance sliders so labels die before the horizon.',
        replies: [
          {
            author: 'monument_mike',
            age: '3w ago',
            score: 10,
            body: 'fight config is readable. i can see heads again. W',
          },
          {
            author: 'sulfur_rat',
            age: '3w ago',
            score: 6,
            body: 'this helped. i had sulfur distance maxed like a maniac.',
          },
        ],
      },
      {
        author: 'berry_bus',
        age: '3w ago',
        score: 5,
        body: 'hemp off during pvp. that one label alone was covering doors.',
      },
      {
        author: 'oilrig_lex',
        age: '3w ago',
        score: 4,
        body: 'saved two configs. switching is faster than unticking 20 rows mid fight.',
      },
      {
        author: 'kayla_nodes',
        age: '2w ago',
        score: 3,
        body: 'yeah the “turn everything on” screenshot is bait. short list or you play a spreadsheet.',
      },
    ],
    sourceTitle: 'ESP for Rust: Gain the Upper Hand with Visual ESP Hacks',
    sourcePath: '/blog/esp-for-rust/',
  },
  {
    slug: 'ak-still-climbs',
    category: 'Guides & Builds',
    categoryTone: 'blue',
    title: 'AK still climbs with no recoil on',
    excerpt: 'No Recoil is on and the last half of the mag still walks up. Slider too low?',
    description:
      'AK still climbed late in the mag. Staff said compare the first shots and the tail, then ease the slider. OP says the hold is usable.',
    author: 'ak_wipe_day',
    age: '2w ago',
    date: 'Oct 28, 2026',
    upvotes: 44,
    flair: 'Solved',
    closed: true,
    body: [
      'no recoil on. first bullets feel ok then the ak walks. wtf.',
      'am i supposed to burst the tail or is yaw/pitch just low? not trying to build a macro.',
    ],
    comments: [
      {
        author: 'RustHacksDev',
        age: '2w ago',
        score: 29,
        developer: true,
        body: 'One mag at a wall, no mouse help. Look at the start, the middle, and the tail. Pitch cuts the climb. Yaw cuts the side walk. If the first shots drop under the crosshair, it is too high. Burst before the tail if it still slides. Leave Rapid Fire off while you test this.',
        replies: [
          {
            author: 'ak_wipe_day',
            age: '2w ago',
            score: 9,
            body: 'eased pitch a notch and i burst the tail. feels normal. ty 🔥',
          },
        ],
      },
      {
        author: 'brad_oil',
        age: '2w ago',
        score: 7,
        body: 'i had rapid fire on too and blamed recoil. turning that off helped more than another slider.',
      },
      {
        author: 'monument_mike',
        age: '2w ago',
        score: 3,
        body: 'wall test is the move. i was “fixing” it while strafing like an idiot.',
      },
    ],
    sourceTitle: 'Rust No Recoil Hack: Weapon Options Explained',
    sourcePath: '/blog/rust-no-recoil-hack/',
  },
  {
    slug: 'new-accounts-die-on-this-pc',
    category: 'General',
    categoryTone: 'purple',
    title: 'New accounts die on this PC only',
    excerpt: 'Fresh logins fail on my desktop and work on a laptop. Menu or spoofer?',
    description:
      'New logins failed on one desktop and worked on a laptop. Staff said that is a PC pattern, not an appeal, and the spoofer is a separate checkout.',
    author: 'brad_oil',
    age: '9d ago',
    date: 'Nov 3, 2026',
    upvotes: 36,
    flair: 'Solved',
    closed: true,
    body: [
      'old login on my laptop still gets in. brand new ones on this desktop die early. sometimes before i even roam.',
      'do i buy ugc or the spoofer? the hack menu is not fixing the login. be real.',
    ],
    comments: [
      {
        author: 'RustHacksDev',
        age: '9d ago',
        score: 24,
        developer: true,
        body: 'If the same new login works on the laptop and dies on the desktop, that is the PC, not the appeal workspace. UGC is for an account that was already restricted. The spoofer is a separate key for a fingerprint problem on a PC you own. The menu does not change disk or network ids. None of these undo a ban that already sits on one account.',
        replies: [
          {
            author: 'brad_oil',
            age: '9d ago',
            score: 8,
            body: 'ok so not ugc. laptop is fine, desktop is the weird one. thanks for not selling me the wrong thing.',
          },
          {
            author: 'kayla_nodes',
            age: '8d ago',
            score: 5,
            body: 'this helped. i almost bought recovery for a pc problem.',
          },
        ],
      },
      {
        author: 'nova_compound',
        age: '8d ago',
        score: 4,
        body: 'three checkouts. i learned that the expensive way last month lol.',
      },
      {
        author: 'hemp_runner',
        age: '8d ago',
        score: 3,
        body: 'test the second pc before you buy anything. that step alone saved me.',
      },
      {
        author: 'jake_launchsite',
        age: '7d ago',
        score: 2,
        body: 'yeah the menu will not “fix” a login. different product.',
      },
      {
        author: 'sulfur_rat',
        age: '7d ago',
        score: 6,
        body: 'W breakdown. account vs pc is the whole question.',
      },
    ],
    sourceTitle: 'HWID Spoofer Rust Guide: Discover What an HWID Spoofer Does',
    sourcePath: '/blog/hwid-spoofer-rust/',
  },
  {
    slug: 'nov-5-ban-wave-is-my-key-dead',
    category: 'Patch Talk',
    categoryTone: 'orange',
    title: 'Nov 5 ban wave — is my key dead?',
    excerpt: 'Saw the 3,000 account wave. Do I launch or sit on my hands?',
    description:
      'After the 5 Nov scripting ban wave a player asked if the key was dead. Staff pointed at the status color and said a store key is not an unban.',
    author: 'nova_compound',
    age: '1w ago',
    date: 'Nov 5, 2026',
    upvotes: 71,
    flair: 'Solved',
    closed: true,
    body: [
      'facepunch just waved 3000+ scripting accounts. my group chat is melting.',
      'is the rust hacks key dead now or do i wait for the status color? i am not making a fresh account to “dodge” it, that sounds dumb. 💀',
    ],
    comments: [
      {
        author: 'RustHacksDev',
        age: '1w ago',
        score: 48,
        developer: true,
        body: 'Read the status page, not the group chat. Green means this Rust Hacks build is updated and can be used. Red means do not use it. Blue means we are still working and it is not ready. A key is not an unban. EAC bans for third-party software can be permanent and late. A new account to dodge a live ban is evasion.',
        replies: [
          {
            author: 'nova_compound',
            age: '1w ago',
            score: 14,
            body: 'sat it out until the note moved. not making a burner. appreciate the straight answer.',
          },
        ],
      },
      {
        author: 'tc_grief',
        age: '1w ago',
        score: 9,
        body: 'people in discord saying “just make a new steam” are wild. do not.',
      },
      {
        author: 'ak_wipe_day',
        age: '6d ago',
        score: 7,
        body: 'this thread helped. i stopped refreshing the loader on a red note.',
        replies: [
          {
            author: 'berry_bus',
            age: '6d ago',
            score: 3,
            body: 'same. color first. launching anyway is how you donate the account.',
          },
        ],
      },
      {
        author: 'oilrig_lex',
        age: '6d ago',
        score: 5,
        body: 'the wave is facepunch, not “your key expired.” different problems.',
      },
      {
        author: 'sam_site_sam',
        age: '6d ago',
        score: 2,
        body: 'a key is not an unban. i needed to hear that again lol.',
      },
      {
        author: 'bow_kid',
        age: '5d ago',
        score: 4,
        body: 'W. saved me from buying a second account out of panic.',
      },
      {
        author: 'recycler_rin',
        age: '5d ago',
        score: 6,
        body: 'status page > twitter thread. fr.',
      },
    ],
    sourceTitle: 'How to Get Unbanned From Rust: The Complete Guide',
    sourcePath: '/blog/how-to-get-unbanned-from-rust/',
  },
  {
    slug: 'green-on-10-nov-can-i-play',
    category: 'Community',
    categoryTone: 'green',
    title: 'Status is green on 10 Nov — can I play?',
    excerpt: 'Big green label says updated. That means launch, right?',
    description:
      'On 10 Nov 2026 the status label was green. Staff confirmed green means the current build can be used, and red or blue means wait.',
    author: 'jake_launchsite',
    age: '2d ago',
    date: 'Nov 10, 2026',
    upvotes: 22,
    flair: 'Solved',
    closed: true,
    body: [
      'status page got the big green UPDATED label. 10 nov 2026.',
      'so i can use the rust hacks loader? or is green just vibes 😭',
    ],
    comments: [
      {
        author: 'RustHacksDev',
        age: '2d ago',
        score: 18,
        developer: true,
        body: 'Green means the Rust Hacks build is updated. You can use it. Grab the file that matches this note, not a copy from downloads last month. Red means not updated, do not use it. Blue means we are updating and it is not ready.',
        replies: [
          {
            author: 'monument_mike',
            age: '2d ago',
            score: 6,
            body: 'helped. i deleted the october exe before i opened the new one.',
          },
        ],
      },
      {
        author: 'jake_launchsite',
        age: '1d ago',
        score: 5,
        body: 'launched. menu is there. W',
      },
    ],
    sourceTitle: 'Rust Hack Download: Setup Guide and How to Use It',
    sourcePath: '/blog/rust-hack-download/',
  },
  {
    slug: 'fps-died-after-nov-5-patch',
    category: 'Patch Talk',
    categoryTone: 'orange',
    title: 'FPS died after the Nov 5 patch',
    excerpt: 'Clouds, jobs, the whole patch. Is the overlay the thing tanking my frames?',
    description:
      'Frames dropped after the 5 Nov patch. Staff separated the game changes from the overlay and told the player to test with visuals off first.',
    author: 'recycler_rin',
    age: '6h ago',
    date: 'Nov 12, 2026',
    upvotes: 33,
    flair: 'Solved',
    closed: true,
    body: [
      'printed and polished dropped and my fps fell off a cliff. clouds wont turn off anymore?? intel mac friends are just gone lol.',
      'is the hack eating frames or did rust itself do this. overlay is on, players + ores. wtf.',
    ],
    comments: [
      {
        author: 'RustHacksDev',
        age: '5h ago',
        score: 21,
        developer: true,
        body: 'The 5 Nov patch turned player update jobs on by default, kept volumetric clouds on, and dropped Intel Macs. That is the game, not the menu. Test one life with the overlay fully off. If frames are still bad, it is the patch. If they jump, cut distance and turn farm ESP off while you fight. Status is green, so the file is current. Do not “fix fps” by disabling secure boot.',
        replies: [
          {
            author: 'recycler_rin',
            age: '4h ago',
            score: 8,
            body: 'overlay off and it was still rough. so yeah the patch. lowering ore distance helped a bit on top. ty',
          },
          {
            author: 'hemp_runner',
            age: '4h ago',
            score: 4,
            body: 'clouds staying on is the annoying part. not a loader toggle.',
          },
        ],
      },
      {
        author: 'ak_wipe_day',
        age: '3h ago',
        score: 5,
        body: 'same drop on a pc that was not even running the menu. so it is rust. this thread helped me stop reinstalling.',
      },
      {
        author: 'nova_compound',
        age: '3h ago',
        score: 3,
        body: 'military tunnels doors needing boom is unrelated but i am still mad about it 💀',
        replies: [
          {
            author: 'brad_oil',
            age: '2h ago',
            score: 2,
            body: 'and the smg doing 21 now. patch notes are a lot.',
          },
          {
            author: 'kayla_nodes',
            age: '2h ago',
            score: 2,
            body: 'sprint eating more food too. i thought i was bugged.',
          },
        ],
      },
      {
        author: 'sulfur_rat',
        age: '2h ago',
        score: 4,
        body: 'green status + bad fps can both be true. do not mix them up.',
      },
      {
        author: 'jake_launchsite',
        age: '1h ago',
        score: 3,
        body: 'dpv feels faster at least. small W in a messy patch.',
      },
      {
        author: 'oilrig_lex',
        age: '1h ago',
        score: 6,
        body: 'tested overlay off like they said. frames still mid. stopped blaming the loader.',
      },
      {
        author: 'sam_site_sam',
        age: '40m ago',
        score: 1,
        body: 'loot panel closing when i walk away is kinda nice ngl.',
      },
    ],
    sourceTitle: 'Best Rust Hacks Review & Comparison 2026: Features & Value',
    sourcePath: '/blog/best-rust-hacks/',
  },
];

export const forumPosts: ForumPost[] = rawPosts.map(withCounts);

export function getForumPost(slug: string) {
  return forumPosts.find((post) => post.slug === slug);
}
