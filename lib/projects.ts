export type ProjectCategory = 'tables' | 'finish-carpentry' | 'other';

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  /** Filenames within public/images/gallery/<category>/. First is the lead image. */
  images: string[];
  /** Species visible in the piece. Empty when the photo name doesn't record it. */
  woods: string[];
  description: string;
}

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  tables: 'Tables & Desks',
  'finish-carpentry': 'Finish Carpentry',
  other: 'Other Work',
};

export const PROJECTS: Project[] = [
  // ---------------------------------------------------------------- tables
  {
    slug: 'walnut-coffee-table',
    title: 'Walnut Coffee Table',
    category: 'tables',
    images: ['coffee-table-walnut.jpg'],
    woods: ['Walnut'],
    description:
      'A custom coffee table in solid walnut, built to order in Kitchener, Ontario.',
  },
  {
    slug: 'walnut-end-table',
    title: 'Walnut End Table',
    category: 'tables',
    images: ['end-table-walnut.jpg'],
    woods: ['Walnut'],
    description: 'A custom end table in solid walnut, sized to suit the room it lives in.',
  },
  {
    slug: 'walnut-end-table-brass',
    title: 'Walnut End Table with Brass',
    category: 'tables',
    images: ['end-table-walnut-brass.jpg'],
    woods: ['Walnut'],
    description:
      'A walnut end table with brass detailing, combining traditional joinery with a contemporary accent.',
  },
  {
    slug: 'walnut-maple-end-tables',
    title: 'Walnut and Maple End Tables',
    category: 'tables',
    images: ['end-tables-walnut-maple.jpg'],
    woods: ['Walnut', 'Maple'],
    description:
      'A set of end tables pairing dark walnut tops with contrasting maple legs.',
  },
  {
    slug: 'walnut-table-set',
    title: 'Walnut Table Set',
    category: 'tables',
    images: ['walnut-tables.jpg'],
    woods: ['Walnut'],
    description:
      'A matched set of occasional tables in solid walnut — a long console with a shaped top and lower shelf, alongside three shelved side tables.',
  },
  {
    slug: 'cherry-end-table',
    title: 'Cherry End Table',
    category: 'tables',
    images: ['cherry-end-table.jpg'],
    woods: ['Cherry'],
    description: 'A custom end table in solid cherry, a species that deepens in colour with age.',
  },
  {
    slug: 'cherry-desk',
    title: 'Cherry Desk',
    category: 'tables',
    images: ['cherry-desk.jpg'],
    woods: ['Cherry'],
    description: 'A custom home office desk in solid cherry.',
  },
  {
    slug: 'ash-desk',
    title: 'Ash Desk',
    category: 'tables',
    images: ['ash-desk.jpg'],
    woods: ['Ash'],
    description: 'A custom desk in solid ash, a hard, straight-grained domestic hardwood.',
  },
  {
    slug: 'oak-desk',
    title: 'Oak Desk',
    category: 'tables',
    images: ['oak-desk.jpg'],
    woods: ['Red Oak'],
    description: 'A custom home office desk in solid oak.',
  },
  {
    slug: 'refinished-desk',
    title: 'Refinished Desk',
    category: 'tables',
    images: ['desk-refinished.jpg'],
    woods: ['Pine'],
    description: 'An existing desk stripped and refinished rather than replaced.',
  },
  {
    slug: 'media-console',
    title: 'Media Console',
    category: 'tables',
    images: ['media-console.jpg'],
    woods: ['Walnut'],
    description: 'A custom media console built to fit a specific wall and equipment.',
  },
  {
    slug: 'walnut-drawers',
    title: 'Walnut Drawers',
    category: 'tables',
    images: ['drawers-walnut.jpg'],
    woods: ['Walnut'],
    description: 'Solid walnut drawers, fitted and hung as part of a larger custom piece.',
  },
  {
    slug: 'cherry-dovetail-drawer',
    title: 'Cherry Dovetail Drawer',
    category: 'tables',
    images: ['dovetail-drawer-cherry.jpg'],
    woods: ['Cherry'],
    description:
      'A cherry drawer joined with hand-cut dovetails — a joint that holds without relying on fasteners.',
  },

  // ------------------------------------------------------- finish carpentry
  {
    slug: 'custom-kitchen-cabinetry',
    title: 'Custom Kitchen Cabinetry',
    category: 'finish-carpentry',
    images: ['kitchen.jpg', 'kitchen-2.jpg'],
    woods: [],
    description: 'Custom kitchen cabinetry built and installed to fit the room exactly.',
  },
  {
    slug: 'walnut-builtin-cabinet',
    title: 'Walnut Built-In Cabinet',
    category: 'finish-carpentry',
    images: ['cabinet-builtin-walnut.jpg'],
    woods: ['Walnut'],
    description: 'A walnut cabinet built into the surrounding wall as permanent millwork.',
  },
  {
    slug: 'maple-cabinet-bowtie-inlays',
    title: 'Maple Cabinet with Bowtie Inlays',
    category: 'finish-carpentry',
    images: ['cabinet-maple-bowties.jpg'],
    woods: ['Maple', 'Zebrawood'],
    description:
      'A maple cabinet with inlaid bowtie keys, a detail that is both structural and decorative.',
  },
  {
    slug: 'portable-maple-cherry-cabinet',
    title: 'Portable Maple and Cherry Cabinet',
    category: 'finish-carpentry',
    images: ['cabinet-portable-maple-cherry.jpg'],
    woods: ['Maple', 'Cherry'],
    description: 'A freestanding cabinet in maple and cherry, built to be moved rather than fixed.',
  },
  {
    slug: 'custom-cabinet-doors',
    title: 'Custom Cabinet Doors',
    category: 'finish-carpentry',
    images: ['cabinet-doors-custom.jpg'],
    woods: [],
    description:
      'Frame and panel cabinet doors made to replace factory doors on existing cabinetry.',
  },
  {
    slug: 'custom-entryway',
    title: 'Custom Entryway',
    category: 'finish-carpentry',
    images: ['entryway.jpg'],
    woods: ['Ipe', 'Oak'],
    description: 'Built-in entryway storage fitted to the space.',
  },
  {
    slug: 'ladder-and-railing',
    title: 'Ladder and Railing',
    category: 'finish-carpentry',
    images: ['ladder-and-railing.jpg'],
    woods: ['Maple'],
    description: 'A custom ladder and matching railing built as a single piece of joinery.',
  },
  {
    slug: 'wainscotting',
    title: 'Wainscotting',
    category: 'finish-carpentry',
    images: ['wainscotting-1.jpg'],
    woods: [],
    description: 'Custom wainscotting milled and installed to suit the proportions of the room.',
  },

  // ----------------------------------------------------------------- other
  {
    slug: 'walnut-bed',
    title: 'Walnut Bed',
    category: 'other',
    images: ['bed-walnut.jpg'],
    woods: ['Walnut'],
    description: 'A bed frame in solid walnut.',
  },
  {
    slug: 'maple-bed',
    title: 'Maple Bed',
    category: 'other',
    images: ['bed-maple.jpg'],
    woods: ['Maple'],
    description: 'A bed frame in solid maple.',
  },
  {
    slug: 'walnut-shelf',
    title: 'Walnut Shelf',
    category: 'other',
    images: ['shelf-walnut.jpg'],
    woods: ['Walnut'],
    description: 'A solid walnut shelf.',
  },
  {
    slug: 'walnut-stool',
    title: 'Walnut Stool',
    category: 'other',
    images: ['stool-walnut.jpg'],
    woods: ['Walnut'],
    description: 'A solid walnut stool.',
  },
  {
    slug: 'walnut-cube-storage',
    title: 'Walnut Cube Storage',
    category: 'other',
    images: ['cube-storage-walnut.jpg'],
    woods: ['Walnut'],
    description: 'Modular cube storage in solid walnut.',
  },
  {
    slug: 'walnut-storage-tray-brass',
    title: 'Walnut Storage Tray with Brass',
    category: 'other',
    images: ['storage-tray-walnut-brass.jpg'],
    woods: ['Walnut'],
    description: 'A small walnut storage tray with brass hardware.',
  },
  {
    slug: 'walnut-box',
    title: 'Walnut Box',
    category: 'other',
    images: ['box-walnut.jpg'],
    woods: ['Walnut'],
    description: 'A small lidded box in solid walnut.',
  },
  {
    slug: 'dovetailed-box-cherry-maple-walnut',
    title: 'Dovetailed Box in Cherry, Maple and Walnut',
    category: 'other',
    images: ['box-dovetails-cherry-maple-walnut-open.jpg'],
    woods: ['Cherry', 'Maple', 'Walnut'],
    description:
      'A box joined with through dovetails, using the colour contrast between three species to show the joint.',
  },
  {
    slug: 'dovetailed-manitoba-maple-box',
    title: 'Dovetailed Manitoba Maple Box',
    category: 'other',
    images: ['box-dovetails-manitoba-maple.jpg', 'box-dovetails-manitoba-maple-open.jpg'],
    woods: ['Manitoba Maple'],
    description: 'A lidded box in Manitoba maple, joined with through dovetails.',
  },
  {
    slug: 'walnut-olive-tea-box-brass',
    title: 'Walnut and Olive Tea Box with Brass Accents',
    category: 'other',
    images: [
      'tea-box-walnut-brass-olive-maple.jpg',
      'tea-box-walnut-brass-olive-maple-inside.jpg',
    ],
    woods: ['Walnut', 'Olive', 'Maple'],
    description:
      'A compartmented tea box in walnut, olive and maple with brass accents, shown open and closed.',
  },
  {
    slug: 'olive-tea-box-brass',
    title: 'Olive Wood Tea Box with Brass',
    category: 'other',
    images: ['tea-box-olive-brass.jpg'],
    woods: ['Olive'],
    description: 'A tea box in olive wood with brass hardware.',
  },
  {
    slug: 'walnut-cherry-maple-chessboard',
    title: 'Walnut, Cherry and Maple Chessboard',
    category: 'other',
    images: ['chessboard-walnut-cherry-maple.jpg'],
    woods: ['Walnut', 'Cherry', 'Maple'],
    description: 'A chessboard built from alternating walnut, cherry and maple.',
  },
  {
    slug: 'piano-pattern-cutting-board',
    title: 'Piano-Pattern Cutting Board',
    category: 'other',
    images: ['cuttingboard-piano-walnut-maple-cherry.jpg'],
    woods: ['Walnut', 'Maple', 'Cherry'],
    description:
      'An end-grain cutting board laid up in a piano-key pattern from walnut, maple and cherry.',
  },
  {
    slug: 'walnut-cherry-flute-stand',
    title: 'Walnut and Cherry Flute Stand',
    category: 'other',
    images: ['flute-stand-walnut-cherry.jpg'],
    woods: ['Walnut', 'Cherry'],
    description: 'A stand for a flute, made from walnut and cherry.',
  },
  {
    slug: 'zebrawood-shadow-box',
    title: 'Zebrawood Shadow Box',
    category: 'other',
    images: ['shadowbox-zebrawood.jpg'],
    woods: ['Zebrawood'],
    description: 'A shadow box frame in zebrawood, a species with pronounced striped figure.',
  },
  {
    slug: 'walnut-frame-joinery',
    title: 'Walnut Frame Joinery',
    category: 'other',
    images: ['frame-walnut-joint.jpg'],
    woods: ['Walnut'],
    description: 'A detail of the corner joinery on a walnut frame.',
  },
  {
    slug: 'ipe-maple-mallet',
    title: 'Ipe and Maple Mallet',
    category: 'other',
    images: ['mallet-ipe-maple.jpg'],
    woods: ['Ipe', 'Maple'],
    description:
      'A woodworking mallet with an ipe head and maple handle — shop-made rather than commissioned.',
  },
  {
    slug: 'tissue-box-cover',
    title: 'Tissue Box Cover',
    category: 'other',
    images: ['kleenex-1.jpg', 'kleenex-2.jpg'],
    woods: ['Walnut', 'White Oak'],
    description: 'A small wooden cover made to conceal a cardboard tissue box.',
  },
  {
    slug: 'trivets',
    title: 'Trivets',
    category: 'other',
    images: ['trivets.jpg'],
    woods: ['Red Oak', 'Ash'],
    description: 'A set of wooden trivets.',
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find(p => p.slug === slug);
}

/** Maps a gallery photo back to its project, so the lightbox can link through. */
export function getProjectByImage(category: string, filename: string): Project | undefined {
  return PROJECTS.find(p => p.category === category && p.images.includes(filename));
}

export function imagePath(project: Project, index = 0): string {
  return `/images/gallery/${project.category}/${project.images[index]}`;
}

/** Previous/next within the same category, for cross-linking between pages. */
export function getSiblings(project: Project): { prev?: Project; next?: Project } {
  const peers = PROJECTS.filter(p => p.category === project.category);
  const i = peers.findIndex(p => p.slug === project.slug);
  return { prev: peers[i - 1], next: peers[i + 1] };
}
