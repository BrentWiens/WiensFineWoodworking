export type ProjectCategory = 'tables' | 'finish-carpentry' | 'other';

export interface Project {
  slug: string;
  /** The piece's name — the page heading and link text. */
  title: string;
  /**
   * What the piece is, in plain words. Carries the search terms a name like
   * "Nightfall" doesn't, so it goes into the page title and alt text.
   */
  kind: string;
  category: ProjectCategory;
  /** Filenames within public/images/gallery/<category>/. First is the lead image. */
  images: string[];
  /** Species visible in the piece. Empty when the photo doesn't show it. */
  woods: string[];
  /** One sentence, kept under ~160 characters: the page lead and the meta description. */
  description: string;
  /** The longer write-up, one string per paragraph. */
  story: string[];
}

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  tables: 'Tables & Desks',
  'finish-carpentry': 'Finish Carpentry',
  other: 'Other Work',
};

// Names, descriptions and stories are draft copy written from the photos alone, so
// they describe only what can be seen. Anything about who a piece was for, its
// dimensions or its finish has been left out rather than guessed.
export const PROJECTS: Project[] = [
  // ---------------------------------------------------------------- tables
  {
    slug: 'walnut-coffee-table',
    title: 'Ironside',
    kind: 'Walnut Coffee Table',
    category: 'tables',
    images: ['coffee-table-walnut.jpg'],
    woods: ['Walnut'],
    description:
      'A thick walnut slab with a softly rounded edge, set on a black steel base with a solid walnut shelf below.',
    story: [
      'The top is a single wide board of walnut, its grain running from dark chocolate to honey where the figure catches the light. Every edge is eased into a generous round-over, so the slab reads as thick and soft rather than sharp.',
      'Underneath, two black steel frames lift it off the floor and carry a lower shelf glued up from straight-grained walnut — a quieter surface for books and remotes, so the top gets to be the show.',
    ],
  },
  {
    slug: 'walnut-end-table',
    title: 'Eddy',
    kind: 'Walnut End Table',
    category: 'tables',
    images: ['end-table-walnut.jpg'],
    woods: ['Walnut'],
    description:
      'A three-tier walnut end table whose top swirls with dramatic figure, with two lower shelves for books and baskets.',
    story: [
      'Some boards are too good to cut small. The top of this one came from walnut with grain that folds and ripples across its whole width, and a natural check running through it was left visible as part of its character.',
      'Below, two shelves are notched around square legs, their boards showing the streaks of pale sapwood and dark heartwood that make walnut so varied. It’s a simple, sturdy form that lets the wood do the talking.',
    ],
  },
  {
    slug: 'walnut-end-table-brass',
    title: 'Eclipse',
    kind: 'Walnut Nightstands with Brass Pulls',
    category: 'tables',
    images: ['end-table-walnut-brass.jpg'],
    woods: ['Walnut'],
    description:
      'A pair of mid-century-style walnut nightstands with sculpted legs, a single drawer, and a brass pull set across a round cut-out.',
    story: [
      'The detail that gives these their name is the pull: a round finger hole cut through the drawer front, crossed by a slim brass bar like a horizon line across the sun.',
      'The case wraps around the drawer with the grain running over the top and down the sides, held between tapered legs that rise past the case and finish in rounded tops. A lower shelf ties the legs together. The same pair appears beside the Nightfall bed.',
    ],
  },
  {
    slug: 'walnut-maple-end-tables',
    title: 'Duet',
    kind: 'Walnut and Maple End Tables',
    category: 'tables',
    images: ['end-tables-walnut-maple.jpg'],
    woods: ['Walnut', 'Maple'],
    description:
      'Two slim end tables pairing dark walnut tops and shelves with pale maple legs, each shelf notched neatly around the legs.',
    story: [
      'Walnut and maple are about as far apart in colour as North American hardwoods get, and these tables lean into it: every horizontal surface is walnut, every vertical one is maple.',
      'The shelves are let into the legs rather than hung beneath them, so each joint shows as a crisp step where dark meets light. Softly rounded corners and a narrow footprint suit a spot beside a sofa or a bed.',
    ],
  },
  {
    slug: 'walnut-table-set',
    title: 'Homestead',
    kind: 'Walnut Occasional Table Set',
    category: 'tables',
    images: ['walnut-tables.jpg'],
    woods: ['Walnut'],
    description:
      'A matched set of four walnut tables — a long console with a lower shelf, and three side tables with two shelves each.',
    story: [
      'Built as a set so a whole room matches: one long console and three side tables, all in solid walnut with the same square legs and shelf details.',
      'Walnut from different boards shifts in tone, from dark and dramatic to warm and light, and the set shows that range. The table on the left has swirling figure across its top, while the smaller tables have straighter, calmer grain.',
    ],
  },
  {
    slug: 'cherry-end-table',
    title: 'Golden Hour',
    kind: 'Cherry End Table',
    category: 'tables',
    images: ['cherry-end-table.jpg'],
    woods: ['Cherry'],
    description:
      'A three-tier end table in solid cherry, with a thick, softly rounded top and shelves notched into the legs.',
    story: [
      'Cherry starts out pale and pinkish and darkens to a deep reddish-brown over its first years in the light. This table is photographed fresh from the shop, at the very start of that change.',
      'The top has a thick, rounded edge, and two shelves below are notched into the legs, with a stretcher at each end tying the frame together. A few small natural checks and mineral streaks in the top were kept rather than cut away.',
    ],
  },
  {
    slug: 'cherry-desk',
    title: 'Inkwell',
    kind: 'Cherry L-Shaped Desk',
    category: 'tables',
    images: ['cherry-desk.jpg'],
    woods: ['Cherry'],
    description:
      'An L-shaped desk in solid cherry, with its natural knots and voids filled clear so they read like drops of ink across the grain.',
    story: [
      'Two tops meet at a right angle to make a corner workstation, with the grain of each running along its length. Where the cherry had knots and voids, they were filled rather than cut out — small dark marks that give the long top some punctuation.',
      'Straight cherry legs carry the main run, and the far end rests on a cabinet, keeping the space underneath clear for a chair to roll freely.',
    ],
  },
  {
    slug: 'ash-desk',
    title: 'Mission Control',
    kind: 'Ash Standing Desk with Walnut Pedestal',
    category: 'tables',
    images: ['ash-desk.jpg'],
    woods: ['Ash', 'Walnut'],
    description:
      'A sit-stand desk with a solid ash top, a walnut drawer pedestal, a walnut computer stand with walnut front for the computer.',
    story: [
      'An electric frame does the work of raising and lowering; the woodwork makes it look like furniture. A thick ash top with a rounded front edge gives plenty of room for monitors and speakers.',
      'On the right, a three-drawer walnut pedestal holds gear on top and paperwork below. On the left, walnut stand hides a garbage can while raising the computer off the ground.',
    ],
  },
  {
    slug: 'oak-desk',
    title: 'Craftsman’s Corner',
    kind: 'Red Oak L-Shaped Craft Desk',
    category: 'tables',
    images: ['oak-desk.jpg'],
    woods: ['Red Oak'],
    description:
      'A long L-shaped red oak worktop over rows of drawer units, turning a spare room into a craft studio.',
    story: [
      'The brief for a workroom is simple: as much surface and storage as the walls allow. This one runs the length of one wall and turns the corner, with drawer units underneath keeping supplies within reach.',
      'The red oak top shows the species’ bold, open grain and a scattering of knots, finished to bring out its warm colour.',
    ],
  },
  {
    slug: 'refinished-desk',
    title: 'Second Wind',
    kind: 'Refinished Desk',
    category: 'tables',
    images: ['desk-refinished.jpg'],
    woods: ['Pine', 'Oak'],
    description:
      'A well-built older desk stripped back and refinished in a warm amber tone, given a second life rather than replaced.',
    story: [
      'Not every project starts with rough lumber. This desk had good bones — a bank of solid drawers, a shaped base and a drawer over the knee space — but a tired finish.',
      'It was stripped back and refinished in a warm amber tone that brings the figure in the top back to life, then finished with dark metal pulls. Restoring a piece like this keeps well-made furniture in use, often for less than buying new.',
    ],
  },
  {
    slug: 'media-console',
    title: 'Cascade',
    kind: 'Walnut Waterfall Bookcase',
    category: 'tables',
    images: ['media-console.jpg'],
    woods: ['Walnut'],
    description:
      'A long, low walnut bookcase with waterfall corners, so the grain flows unbroken from the top to the floor.',
    story: [
      'A waterfall joint is a mitre cut so the top and sides come from one continuous board, and the grain turns the corner and keeps going. Here it wraps both ends, which makes a simple case look as if it were carved from a single piece.',
      'This piece was designed to showcase one massive board',
      'Inside, a long shelf and a single divider make room for tall picture books, puzzles and boxes below, with display space above.',
    ],
  },
  {
    slug: 'walnut-drawers',
    title: 'Anchor',
    kind: 'Walnut Drawer Pedestal',
    category: 'tables',
    images: ['drawers-walnut.jpg'],
    woods: ['Walnut',  'cherry'],
    description:
      'A three-drawer walnut pedestal with frame-and-panel drawer fronts and long brushed-steel pulls, built to sit under a desk.',
    story: [
      'Each drawer front is a small frame-and-panel — the same construction used for cabinet doors — which gives the fronts a subtle recessed centre and helps keep them flat over time.',
      'The case sides are solid walnut, with a streak of pale sapwood left along the bottom edge. It’s the pedestal that sits under the Mission Control standing desk.',
      'The drawer boxes are solid cherry, with dovetail joinery and a natural finish that shows the wood’s warm colour and figure. The drawers run on full-extension ball-bearing slides, so they open smoothly and fully.',
    ],
  },
  {
    slug: 'cherry-dovetail-drawer',
    title: 'Tails & Pins',
    kind: 'Dovetailed Drawer in Walnut and Cherry',
    category: 'tables',
    images: ['dovetail-drawer-cherry.jpg'],
    woods: ['Walnut', 'Cherry'],
    description:
      'A close look at a drawer: cherry sides joined to the front with dovetails, behind a walnut drawer face.',
    story: [
      'Dovetails are the traditional way to build a drawer that survives decades of being pulled open. The angled tails on the cherry side lock into pins on the front, so every pull draws the joint tighter instead of working it apart.',
      'The walnut face sits over the front, with a rounded edge that’s comfortable to grab. Inside a drawer is exactly where good work usually goes unnoticed; contrasting woods make it easy to see.',
    ],
  },

  // ------------------------------------------------------- finish carpentry
  {
    slug: 'custom-kitchen-cabinetry',
    title: 'Clean Slate',
    kind: 'Custom Kitchen Cabinetry',
    category: 'finish-carpentry',
    images: ['kitchen.jpg', 'kitchen-2.jpg'],
    woods: [],
    description:
      'White kitchen cabinetry built and installed to fit the room, with matte black hardware throughout.',
    story: [
      'Kitchen cabinets have to fit the room exactly and work around windows, appliances and walls that are rarely square.',
      'The first photo shows a long galley run with shaker-style doors, crown moulding carried along the uppers and deep drawer banks beside the sink. The second shows a smaller layout with flat slab doors and dark countertops, planned around a window and a doorway. Both are shown mid-install, before the backsplash and final trim.',
    ],
  },
  {
    slug: 'walnut-builtin-cabinet',
    title: 'Bookmatch',
    kind: 'Walnut Built-In Wardrobe',
    category: 'finish-carpentry',
    images: ['cabinet-builtin-walnut.jpg'],
    woods: ['Walnut'],
    description:
      'A walnut wardrobe built into a closet opening, with bookmatched door panels, a bank of five drawers and brass pulls.',
    story: [
      'Bookmatching means slicing a board and opening it like a book, so the two halves mirror each other. On the tall doors, the grain meets in the middle in a pattern like an hourglass.',
      'Beside them, five drawers sit under a pair of small doors, all in frame-and-panel construction with slim brass pulls. The unit fills the closet opening wall to wall, turning an ordinary closet into a piece of furniture. A natural void in one door frame was left in place as a reminder that it’s solid wood.',
    ],
  },
  {
    slug: 'maple-cabinet-bowtie-inlays',
    title: 'Bowtie',
    kind: 'Maple Cabinet with Bowtie Inlays',
    category: 'finish-carpentry',
    images: ['cabinet-maple-bowties.jpg'],
    woods: ['Maple', 'Zebrawood'],
    description:
      'A maple entry cabinet with a thick, butcher-block-style top, its natural cracks held by five contrasting zebrawood bowtie inlays.',
    story: [
      'The top is glued up from strips of maple with plenty of natural character, including checks running along its length. Rather than hide them, bowtie inlays — also called butterfly keys — are set across the cracks to stop them spreading, and turned into a feature.',
      'Below, a full-width drawer sits over two shaker doors with brushed-steel pulls. It’s sized for a front hall, where it catches keys, mail and everything else that comes in the door.',
    ],
  },
  {
    slug: 'portable-maple-cherry-cabinet',
    title: 'Roadshow',
    kind: 'Rolling Maple Hutch with Live-Edge Cherry',
    category: 'finish-carpentry',
    images: ['cabinet-portable-maple-cherry.jpg'],
    woods: ['Maple', 'Cherry'],
    description:
      'A mobile maple cabinet on casters, topped with a live-edge cherry slab and a tall back fitted with a wire display grid.',
    story: [
      'This one is meant to move. The maple base rolls on casters and holds storage behind two shaker doors; above it, a tall back panel carries a black wire grid for hanging and clipping displays.',
      'The work surface and the crown are both live-edge cherry, keeping the natural edge of the tree. Short phrases are stamped across the top — small messages worked into the surface of the piece.',
    ],
  },
  {
    slug: 'custom-cabinet-doors',
    title: 'Cove Corners',
    kind: 'Custom Cabinet Doors',
    category: 'finish-carpentry',
    images: ['cabinet-doors-custom.jpg'],
    woods: [],
    description:
      'Painted cabinet doors with applied panel mouldings and cove-notched corners, made to replace the factory doors on existing cabinets.',
    story: [
      'New doors are one of the most effective ways to change a room without tearing out the cabinets. These keep the existing boxes and replace only what you see.',
      'Each door has a moulding framing its centre panel, with every corner cut in a concave notch — the same classic detail used on the Rise & Panel staircase wainscotting.',
    ],
  },
  {
    slug: 'custom-entryway',
    title: 'Homecoming',
    kind: 'Entryway Nook with Peg Rail and Bench',
    category: 'finish-carpentry',
    images: ['entryway.jpg'],
    woods: ['Ipe', 'Oak'],
    description:
      'A built-in entry nook, hooks for coats and bags, an upper shelf for baskets.',
    story: [
      'Every house needs a place to drop coats, bags and boots on the way in. This nook turns a recess by the stairs into exactly that.',
      'A wide board carries two rows of turned wooden pegs, with a shelf above for baskets.',
    ],
  },
  {
    slug: 'ladder-and-railing',
    title: 'Loft Line',
    kind: 'Maple Loft Ladder and Railing',
    category: 'finish-carpentry',
    images: ['ladder-and-railing.jpg'],
    woods: ['Maple'],
    description:
      'A steep maple ship’s ladder up to a loft, paired with a matching maple railing of turned balusters.',
    story: [
      'In a small building with a loft, a full staircase eats too much floor. A ship’s ladder — steeper than a stair, with flat treads rather than rungs — gets you up while leaving the room below open.',
      'The ladder’s stringers and treads are solid maple, and so is the loft railing above: turned balusters between square newels with round caps, all in a light natural finish that suits the bright, vaulted space.',
    ],
  },
  {
    slug: 'wainscotting',
    title: 'Rise & Panel',
    kind: 'Staircase Wainscotting',
    category: 'finish-carpentry',
    images: ['wainscotting-1.jpg'],
    woods: ['Maple'],
    description:
      'Applied-moulding wainscotting that follows the rake of a staircase, with cove-notched panel corners and a detailed chair rail.',
    story: [
      'Wainscotting on a stair is harder than on a flat wall: every panel has to follow the angle of the stairs, and the mouldings have to turn cleanly where the slope meets the landing.',
      'Each panel is framed in an applied moulding with concave notched corners, laid out so the panels step up with the stairs. A decorative chair rail runs above them, climbing the stair and levelling off at the top.',
    ],
  },

  // ----------------------------------------------------------------- other
  {
    slug: 'walnut-bed',
    title: 'Nightfall',
    kind: 'Walnut Bed Frame',
    category: 'other',
    images: ['bed-walnut.jpg'],
    woods: ['Walnut'],
    description:
      'A solid walnut bed with a wide single-board headboard between square posts, shown with the matching Eclipse nightstands.',
    story: [
      'The headboard is a single wide panel of walnut set between square posts, simple enough to let the grain carry it. At the foot, the posts are shaped where the rail meets them, a small detail that softens the frame.',
      'It’s shown with the Eclipse nightstands on either side, in the same dark walnut.',
    ],
  },
  {
    slug: 'maple-bed',
    title: 'Wildwood',
    kind: 'Spalted Maple Bed Frame',
    category: 'other',
    images: ['bed-maple.jpg'],
    woods: ['Manitoba Maple'],
    description:
      'A single bed in manitoba maple, its headboard and rails marked with the distinct red of the wood that shout its character.',
    story: [
      'This bed focuses on the red in the wood everywhere: the headboard is one striking panel with a natural void and bold ink-line figure, and the rails and posts carry pink and brown streaks along their length. Plain, square joinery keeps the focus on the wood.',
    ],
  },
  {
    slug: 'walnut-shelf',
    title: 'Stepback',
    kind: 'Walnut Wall Shelf',
    category: 'other',
    images: ['shelf-walnut.jpg'],
    woods: ['Walnut'],
    description:
      'A two-tier walnut wall shelf with a stepped profile, rounded side tops and a low front lip to keep things from sliding off.',
    story: [
      'Each side is a single board with its top corners rounded over, and the back panels show off walnut’s cathedral grain. A low rail across the bottom shelf keeps spices, small books or keepsakes in place.',
    ],
  },
  {
    slug: 'walnut-stool',
    title: 'Wedged',
    kind: 'Walnut Step Stool',
    category: 'other',
    images: ['stool-walnut.jpg'],
    woods: ['Walnut', 'Maple'],
    description:
      'A low walnut step stool with a thick figured top, its legs joined with wedged through-tenons left visible on top.',
    story: [
      'The legs pass right through the seat, and each tenon is wedged from above so it can’t work loose. On top, the tenon ends and their contrasting wedges make a small pattern at each corner.',
      'The seat is cut from walnut with rippling figure and rounded over at every edge, so it’s comfortable underfoot and pleasant to pick up.',
    ],
  },
  {
    slug: 'walnut-cube-storage',
    title: 'Six Squares',
    kind: 'Walnut Cube Shelf',
    category: 'other',
    images: ['cube-storage-walnut.jpg'],
    woods: ['Walnut'],
    description:
      'A six-cube walnut storage unit with rounded inside edges and an overhanging top, sized for baskets or books.',
    story: [
      'Flat-pack cube shelves are everywhere; this is the solid-wood version. Every opening has softly rounded edges, and the top overhangs the sides with a rounded lip.',
      'A few natural knots were kept for character.',
    ],
  },
  {
    slug: 'walnut-storage-tray-brass',
    title: 'Drop Zone',
    kind: 'Walnut Valet Tray with Brass Key Rack',
    category: 'other',
    images: ['storage-tray-walnut-brass.jpg'],
    woods: ['Walnut', 'Brass'],
    description:
      'An entryway valet: a figured walnut tray for coins and wallets, with a walnut key bar held up on brass rods and pegs.',
    story: [
      'The tray is hollowed from walnut with swirling figure, its natural cracks filled black and left as dark lines through the grain. It’s a place for everything that comes out of your pockets.',
      'Two brass rods rise from the back to carry a walnut bar with four brass pegs for keys. It’s shown on top of the Bowtie cabinet.',
    ],
  },
  {
    slug: 'walnut-box',
    title: 'The Keepsake',
    kind: 'Walnut Box with Splined Corners',
    category: 'other',
    images: ['box-walnut.jpg'],
    woods: ['Walnut', 'Maple'],
    description:
      'A latched walnut box with light-coloured splines across its corners, a raised lid panel and a custom logo wood burned on top.',
    story: [
      'The corners are mitred, then reinforced with thin splines set across each joint. They add strength and leave pale stripes that stand out against the walnut.',
      'The lid has a raised centre panel engraved with a custom logo, and the box closes with an antique-brass latch. A box like this makes a lasting gift for a business or an occasion.',
    ],
  },
  {
    slug: 'dovetailed-box-cherry-maple-walnut',
    title: 'Ripple',
    kind: 'Dovetailed Box in Cherry, Maple and Walnut',
    category: 'other',
    images: ['box-dovetails-cherry-maple-walnut-open.jpg'],
    woods: ['Cherry', 'Maple', 'Walnut'],
    description:
      'A small dovetailed cherry box with a curly maple lid panel and floor, walnut liners and brass hinges.',
    story: [
      'Curly maple has a rippling shimmer that shifts as you tilt it. Here it’s used for the lid panel and the floor, framed by warm cherry sides joined with dovetails at the corners.',
      'Thin walnut liners run around the inside, drawing a dark line between the two lighter woods. Brass hinges hold the lid, and small brass bumpers on the rim cushion it as it closes.',
    ],
  },
  {
    slug: 'dovetailed-manitoba-maple-box',
    title: 'Ember',
    kind: 'Dovetailed Manitoba Maple Box',
    category: 'other',
    images: ['box-dovetails-manitoba-maple.jpg', 'box-dovetails-manitoba-maple-open.jpg'],
    woods: ['Manitoba Maple', 'Walnut', 'Maple'],
    description:
      'A dovetailed box in Manitoba maple, whose vivid red streaks wrap around the sides, with a walnut lid and a curly maple floor.',
    story: [
      'Manitoba maple is often dismissed as a weed tree, but its heartwood can hold streaks of red and pink that no other maple has. The boards for this box were arranged so a red vein runs around the corners.',
      'The corners are joined with through dovetails, the lid is a walnut panel framed in maple, and inside, a curly maple floor shimmers under the light. Brass hinges and two brass latches finish it off.',
    ],
  },
  {
    slug: 'walnut-olive-tea-box-brass',
    title: 'Steep',
    kind: 'Walnut Tea Chest with Olive and Brass',
    category: 'other',
    images: [
      'tea-box-walnut-brass-olive-maple.jpg',
      'tea-box-walnut-brass-olive-maple-inside.jpg',
    ],
    woods: ['Walnut', 'Olive', 'Maple', 'Brass'],
    description:
      'A nine-compartment walnut tea chest with brass-keyed corners, an olive wood lid panel and figured maple dividers.',
    story: [
      'Nine slots, each sized for a stack of tea bags, so a whole collection lives in one box. The dividers are thin, figured maple, a light counterpoint to the dark walnut case.',
      'The mitred corners are keyed with brass, and the lid panel is olive wood with bold stripes of figure. Brass hinges carry the lid.',
    ],
  },
  {
    slug: 'olive-tea-box-brass',
    title: 'Brass Band',
    kind: 'Olive Wood Tea Caddy with Brass Rim',
    category: 'other',
    images: ['tea-box-olive-brass.jpg'],
    woods: ['Olive', 'Brass'],
    description:
      'An open four-compartment tea caddy in wildly figured olive wood, capped with a mitred band of brushed brass.',
    story: [
      'Olive wood has some of the most dramatic figure of any timber, all swirls and dark lines, and this caddy is built to show it on every side.',
      'A band of brushed brass is mitred around the top edge, and figured maple dividers split the inside into four compartments.',
    ],
  },
  {
    slug: 'walnut-cherry-maple-chessboard',
    title: 'Endgame',
    kind: 'Walnut, Maple and Cherry Chessboard',
    category: 'other',
    images: ['chessboard-walnut-cherry-maple.jpg'],
    woods: ['Walnut', 'Maple', 'Cherry'],
    description:
      'A chessboard of walnut and maple squares, framed by a wide cherry border with mitred corners and a bevelled edge.',
    story: [
      'Sixty-four squares have to line up perfectly, or the eye catches it immediately. Dark walnut and pale maple give strong contrast for play, and a few of the maple squares carry a hint of curl.',
      'The wide cherry border is mitred at each corner and bevelled toward the outside edge. Cherry darkens with age, so the frame will deepen around the board over the years.',
    ],
  },
  {
    slug: 'piano-pattern-cutting-board',
    title: 'Middle C',
    kind: 'Piano-Key End-Grain Cutting Board',
    category: 'other',
    images: ['cuttingboard-piano-walnut-maple-cherry.jpg'],
    woods: ['Walnut', 'Maple', 'Cherry'],
    description:
      'A thick end-grain cutting board laid out as a piano keyboard, with walnut black keys and thin walnut lines between the white keys.',
    story: [
      'End-grain boards are made from short blocks stood on end, so a knife slips between the fibres rather than slicing across them. That’s easier on your knives and helps the board hide cut marks.',
      'This one turns the construction into a keyboard: walnut blocks form the black keys, and a thin walnut line separates each white key, running all the way down the edge. It sits on small feet to keep it off the counter.',
    ],
  },
  {
    slug: 'walnut-cherry-flute-stand',
    title: 'Resting Note',
    kind: 'Walnut and Cherry Flute Stand',
    category: 'other',
    images: ['flute-stand-walnut-cherry.jpg'],
    woods: ['Walnut', 'Cherry'],
    description:
      'A pair of chevron-shaped walnut cradles with laminated cherry and walnut stripes, made to hold a flute.',
    story: [
      'Each cradle is cut into a stepped chevron from a laminated blank, so every edge shows alternating stripes of walnut and cherry.',
      'Set side by side, the notches line up to hold the instrument safely off the surface, and angled feet keep each cradle upright.',
    ],
  },
  {
    slug: 'zebrawood-shadow-box',
    title: 'Service Record',
    kind: 'Zebrawood Military Shadow Box',
    category: 'other',
    images: ['shadowbox-zebrawood.jpg'],
    woods: ['Zebrawood'],
    description:
      'A deep zebrawood shadow box built to display military medals, badges and a beret, with dark keys across its corners.',
    story: [
      'A shadow box has to be deep enough to hold real objects, not just paper — here, a beret, medals on their ribbons, badges and identification tags.',
      'The case is zebrawood, whose bold dark stripes suit a formal piece, and each corner is reinforced with thin dark keys. It’s built to keep something important safe and on display.',
    ],
  },
  {
    slug: 'walnut-frame-joinery',
    title: 'Pinned Corner',
    kind: 'Walnut Picture Frame',
    category: 'other',
    images: ['frame-walnut-joint.jpg'],
    woods: ['Walnut', 'Ipe'],
    description:
      'A walnut frame for an oil painting, its corners joined with through mortise-and-tenons and pinned with walnut dowels.',
    story: [
      'Most picture frames are held together with a mitre and a hidden fastener. This one uses furniture joinery instead: each corner is a through mortise-and-tenon, pinned with a dowel.',
      'The end of the tenon shows on the outside edge as a neat rectangle of end grain — a small, honest detail that tells you how the frame is made.',
    ],
  },
  {
    slug: 'ipe-maple-mallet',
    title: 'Heavy Hitter',
    kind: 'Ipe and Maple Joiner’s Mallets',
    category: 'other',
    images: ['mallet-ipe-maple.jpg'],
    woods: ['Ipe', 'Maple'],
    description:
      'A pair of shop-made joiner’s mallets with heavy, dense heads and faceted maple handles wedged through the top.',
    story: [
      'A good mallet needs weight in the head and a handle that won’t come loose. These have dense, dark heads, with the maple handle passing all the way through and locked with wedges visible on top.',
      'These are tools rather than commissions — made for use in the shop.',
    ],
  },
  {
    slug: 'tissue-box-cover',
    title: 'Hidden in Plain Sight',
    kind: 'Walnut and White Oak Tissue Box Covers',
    category: 'other',
    images: ['kleenex-1.jpg', 'kleenex-2.jpg'],
    woods: ['Walnut', 'White Oak'],
    description:
      'Solid wood tissue box covers — one in walnut with through dovetails, and a set in white oak with walnut-pinned corners.',
    story: [
      'A tissue box sits out in nearly every room and never looks good. These covers slip over it and turn it into something worth leaving on the counter.',
      'The walnut cover is joined with through dovetails at each corner. The white oak covers are pinned with walnut dowels, shown in both a natural finish and a weathered grey. Rounded top edges and a smooth oval opening finish them off.',
    ],
  },
  {
    slug: 'trivets',
    title: 'Full Circle',
    kind: 'Oak and Ash Trivets',
    category: 'other',
    images: ['trivets.jpg'],
    woods: ['Red Oak', 'Ash'],
    description:
      'A batch of oval trivets in red oak and ash, each routed with a shallow dish inside a raised rim.',
    story: [
      'Made as a batch, so no two came out the same: some are pale, straight-grained ash, others red oak with bold open grain, a knot or a dark streak of figure.',
      'Each is routed with a shallow recess inside a rounded rim. They make easy gifts, and the variation means every one feels like its own piece.',
    ],
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
