/*
 * Social — Athens, GA city data
 * ------------------------------------------------------------------
 * ⚠️  PLACEHOLDER DATA: every bar and deal below is FICTIONAL.
 *     Street names are real downtown Athens streets, but the bars,
 *     addresses, coordinates, prices and hours are made up for demo.
 *
 * DATA SHAPE (enter each bar once; deals repeat weekly):
 *   bar  = { id, name, address, lat, lng, age, cover, hours, popularity (1–100), sample, deals: [...] }
 *   deal = { id, title, type, kind, days, start, end, score, finePrint }
 *     type  : "drinks" | "happyhour" | "nocover" | "events" | "food"   (filter chips)
 *     kind  : finer label used to space out similar deals + "Not interested"
 *             e.g. beer, wells, cocktails, shots, wine, mimosas, trivia, karaoke,
 *                  music, dj, dance, games, food, wings, tacos, cover
 *     days  : 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
 *     start/end : "HH:MM" 24h. If end <= start the deal runs past midnight
 *                 (e.g. start "21:00", end "02:00" = 9pm–2am).
 *     score : 1–5, how good the deal is (used to pick a bar's best deal)
 *
 * The easiest way to edit this is admin.html → "Download data file",
 * then replace this file with the download.
 */
window.SOCIAL_CITIES = window.SOCIAL_CITIES || {};
window.SOCIAL_CITIES.athens = {
  id: "athens",
  name: "Athens, GA",
  school: "UGA",
  center: { lat: 33.9576, lng: -83.3748, label: "the Arch" },
  placeholder: true,
  bars: [
    { id: "velvet-hound", name: "The Velvet Hound", address: "210 E Clayton St, Athens, GA 30601", lat: 33.9591, lng: -83.3755, age: "21+", cover: "No cover", hours: "Mon–Sat 4pm–2am · Sun 4pm–12am", popularity: 92, sample: true,
      deals: [
        { id: "vh1", title: "$3 wells until 11", type: "drinks", kind: "wells", days: [1, 4], start: "21:00", end: "23:00", score: 4, finePrint: "Rail liquor only. Doubles not included." },
        { id: "vh2", title: "$3 well drinks", type: "drinks", kind: "wells", days: [2, 3], start: "21:00", end: "23:00", score: 4, finePrint: "Rail liquor only." },
        { id: "vh3", title: "Half-price drafts", type: "happyhour", kind: "beer", days: [0, 1, 2, 3, 4, 5, 6], start: "16:00", end: "19:00", score: 3, finePrint: "Excludes seasonal taps." }
      ] },
    { id: "lamplight", name: "Lamplight Tavern", address: "180 College Ave, Athens, GA 30601", lat: 33.9587, lng: -83.3751, age: "21+", cover: "$5 after 10pm Fri–Sat", hours: "Daily 5pm–2am (Sun til 12am)", popularity: 85, sample: true,
      deals: [
        { id: "lt1", title: "Trivia night — winning team drinks free", type: "events", kind: "trivia", days: [2], start: "20:00", end: "22:00", score: 4, finePrint: "Teams up to 6. Winners get one round on the house." },
        { id: "lt2", title: "$2 domestic cans", type: "drinks", kind: "beer", days: [4], start: "21:00", end: "00:00", score: 4, finePrint: "" },
        { id: "lt3", title: "No cover before 10", type: "nocover", kind: "cover", days: [5, 6], start: "20:00", end: "22:00", score: 3, finePrint: "$5 cover starts at 10pm sharp." }
      ] },
    { id: "neon-magnolia", name: "Neon Magnolia", address: "300 E Washington St, Athens, GA 30601", lat: 33.9582, lng: -83.3739, age: "18+ to enter · 21+ to drink", cover: "$5 (18–20: $10)", hours: "Wed–Sat 9pm–2am", popularity: 88, sample: true,
      deals: [
        { id: "nm1", title: "Karaoke + $4 pitchers", type: "events", kind: "karaoke", days: [3], start: "21:00", end: "01:00", score: 4, finePrint: "Domestic pitchers only." },
        { id: "nm2", title: "$1 shots 10–11pm", type: "drinks", kind: "shots", days: [5], start: "22:00", end: "23:00", score: 5, finePrint: "House shots. Limit 2 per order." },
        { id: "nm3", title: "$5 Long Islands", type: "drinks", kind: "cocktails", days: [6], start: "21:00", end: "00:00", score: 4, finePrint: "" }
      ] },
    { id: "copper-fox", name: "Copper Fox Taproom", address: "150 W Clayton St, Athens, GA 30601", lat: 33.9594, lng: -83.3772, age: "21+", cover: "No cover", hours: "Daily 3pm–12am (Fri–Sat til 2am)", popularity: 70, sample: true,
      deals: [
        { id: "cf1", title: "$4 local pints", type: "happyhour", kind: "beer", days: [1, 2, 3, 4, 5], start: "15:00", end: "18:00", score: 3, finePrint: "Georgia breweries only." },
        { id: "cf2", title: "Pint night — keep the glass", type: "events", kind: "beer", days: [4], start: "19:00", end: "22:00", score: 3, finePrint: "While glasses last." },
        { id: "cf3", title: "Pretzel + pint for $8", type: "food", kind: "food", days: [0], start: "12:00", end: "20:00", score: 3, finePrint: "" }
      ] },
    { id: "bluebird", name: "Bluebird Rooftop", address: "120 E Broad St, Athens, GA 30601", lat: 33.9575, lng: -83.3758, age: "21+", cover: "No cover", hours: "Daily 4pm–2am (Sun til 12am)", popularity: 90, sample: true,
      deals: [
        { id: "bb1", title: "Sunset happy hour: $6 cocktails", type: "happyhour", kind: "cocktails", days: [0, 1, 2, 3, 4, 5, 6], start: "16:00", end: "19:00", score: 4, finePrint: "Signature menu only. Rooftop seating first come, first served." },
        { id: "bb2", title: "Half-price wine Wednesday", type: "drinks", kind: "wine", days: [3], start: "17:00", end: "23:00", score: 4, finePrint: "Glasses and bottles." },
        { id: "bb3", title: "DJ on the roof, no cover", type: "nocover", kind: "dj", days: [6], start: "22:00", end: "02:00", score: 4, finePrint: "Weather permitting." }
      ] },
    { id: "dawg-house", name: "Dawg House Pub", address: "240 N Lumpkin St, Athens, GA 30601", lat: 33.9598, lng: -83.3787, age: "21+", cover: "No cover", hours: "Daily 11am–2am (Sun til 12am)", popularity: 75, sample: true,
      deals: [
        { id: "dh1", title: "$5 wings + $3 domestics", type: "food", kind: "wings", days: [1], start: "17:00", end: "22:00", score: 4, finePrint: "6 wings, any sauce." },
        { id: "dh2", title: "Game day: $12 buckets", type: "drinks", kind: "beer", days: [6], start: "11:00", end: "19:00", score: 4, finePrint: "5 domestic bottles." },
        { id: "dh3", title: "$2 tall boys", type: "drinks", kind: "beer", days: [2], start: "20:00", end: "00:00", score: 4, finePrint: "" }
      ] },
    { id: "basement-jackson", name: "The Basement on Jackson", address: "155 N Jackson St, Athens, GA 30601", lat: 33.9593, lng: -83.3745, age: "18+ to enter · 21+ to drink", cover: "$7 · free with student ID before 11", hours: "Wed–Sat 9pm–2am", popularity: 80, sample: true,
      deals: [
        { id: "bj1", title: "Free cover with student ID before 11", type: "nocover", kind: "cover", days: [4, 5, 6], start: "21:00", end: "23:00", score: 4, finePrint: "Valid college ID required." },
        { id: "bj2", title: "Indie night: live bands + $3 PBR", type: "events", kind: "music", days: [3], start: "21:00", end: "01:00", score: 4, finePrint: "$5 show cover." }
      ] },
    { id: "pulaski-saloon", name: "Pulaski Street Saloon", address: "280 N Pulaski St, Athens, GA 30601", lat: 33.9603, lng: -83.3795, age: "21+", cover: "No cover", hours: "Tue–Sat 4pm–2am", popularity: 60, sample: true,
      deals: [
        { id: "ps1", title: "Line dancing lessons + $3 Coors Light", type: "events", kind: "dance", days: [4], start: "20:00", end: "23:00", score: 4, finePrint: "Lessons start at 8:30." },
        { id: "ps2", title: "$4 whiskey shots", type: "drinks", kind: "shots", days: [5, 6], start: "21:00", end: "01:00", score: 3, finePrint: "" },
        { id: "ps3", title: "$2 off everything", type: "happyhour", kind: "wells", days: [2, 3, 4, 5], start: "16:00", end: "19:00", score: 3, finePrint: "Excludes top shelf." }
      ] },
    { id: "gold-leaf", name: "Gold Leaf Lounge", address: "195 E Hancock Ave, Athens, GA 30601", lat: 33.9608, lng: -83.3752, age: "21+", cover: "$10 Sat after 10pm", hours: "Tue–Sun 5pm–2am (Sun til 12am)", popularity: 78, sample: true,
      deals: [
        { id: "gl1", title: "$7 martinis", type: "happyhour", kind: "cocktails", days: [2, 3, 4, 5, 6], start: "17:00", end: "20:00", score: 3, finePrint: "" },
        { id: "gl2", title: "Jazz Thursday, no cover", type: "nocover", kind: "music", days: [4], start: "20:00", end: "23:00", score: 4, finePrint: "" },
        { id: "gl4", title: "Industry night: half-price cocktails", type: "drinks", kind: "cocktails", days: [2], start: "21:00", end: "01:00", score: 4, finePrint: "Show a service-industry pay stub for an extra 10% off." },
        { id: "gl3", title: "Half-price wine bottles", type: "drinks", kind: "wine", days: [0], start: "18:00", end: "23:00", score: 4, finePrint: "" }
      ] },
    { id: "corner-pocket", name: "Corner Pocket", address: "360 E Clayton St, Athens, GA 30601", lat: 33.9589, lng: -83.3730, age: "21+", cover: "No cover", hours: "Daily 4pm–2am (Sun til 12am)", popularity: 65, sample: true,
      deals: [
        { id: "cp1", title: "Free pool before 9", type: "events", kind: "games", days: [1, 2, 3, 4], start: "16:00", end: "21:00", score: 3, finePrint: "One table per group." },
        { id: "cp3", title: "Beer pong tournament, $50 prize", type: "events", kind: "games", days: [2], start: "21:00", end: "00:00", score: 4, finePrint: "Teams of 2. Sign up by 9pm." },
        { id: "cp2", title: "$3 Jäger bombs", type: "drinks", kind: "shots", days: [3], start: "22:00", end: "01:00", score: 3, finePrint: "" }
      ] },
    { id: "taco-libre", name: "Taco Libre Cantina", address: "225 E Broad St, Athens, GA 30601", lat: 33.9577, lng: -83.3741, age: "All ages before 9pm · 21+ after", cover: "No cover", hours: "Daily 11am–12am (Fri–Sat til 2am)", popularity: 82, sample: true,
      deals: [
        { id: "tl1", title: "$2 tacos", type: "food", kind: "tacos", days: [2], start: "17:00", end: "23:00", score: 5, finePrint: "Chicken, pork, or veggie." },
        { id: "tl2", title: "$5 margaritas", type: "happyhour", kind: "cocktails", days: [0, 1, 2, 3, 4, 5, 6], start: "15:00", end: "18:00", score: 3, finePrint: "House rocks or frozen." },
        { id: "tl3", title: "$15 margarita pitchers", type: "drinks", kind: "cocktails", days: [5], start: "21:00", end: "00:00", score: 4, finePrint: "" }
      ] },
    { id: "electric-ave", name: "Electric Avenue", address: "140 W Washington St, Athens, GA 30601", lat: 33.9584, lng: -83.3778, age: "18+ to enter · 21+ to drink", cover: "$5 (18–20: $10)", hours: "Thu–Sat 10pm–2am", popularity: 87, sample: true,
      deals: [
        { id: "ea1", title: "$1 drinks 10–11pm", type: "drinks", kind: "wells", days: [5], start: "22:00", end: "23:00", score: 5, finePrint: "Wells and domestic drafts." },
        { id: "ea2", title: "Throwback DJ night", type: "events", kind: "dj", days: [6], start: "22:00", end: "02:00", score: 3, finePrint: "" },
        { id: "ea3", title: "No cover Thursdays", type: "nocover", kind: "cover", days: [4], start: "22:00", end: "02:00", score: 4, finePrint: "21+ only on Thursdays." }
      ] },
    { id: "hollow-oak", name: "Hollow Oak Brewing", address: "520 N Thomas St, Athens, GA 30601", lat: 33.9620, lng: -83.3722, age: "21+", cover: "No cover", hours: "Tue–Sun 3pm–11pm", popularity: 55, sample: true,
      deals: [
        { id: "ho1", title: "Trivia + $1 off flights", type: "events", kind: "trivia", days: [3], start: "19:00", end: "21:00", score: 3, finePrint: "" },
        { id: "ho2", title: "Food truck Fridays", type: "food", kind: "food", days: [5], start: "17:00", end: "21:00", score: 3, finePrint: "Truck lineup rotates weekly." },
        { id: "ho3", title: "$4 house beers", type: "happyhour", kind: "beer", days: [2, 3, 4, 5], start: "16:00", end: "18:00", score: 3, finePrint: "" }
      ] },
    { id: "southpaw", name: "Southpaw Sports Bar", address: "260 W Broad St, Athens, GA 30601", lat: 33.9571, lng: -83.3793, age: "21+", cover: "No cover", hours: "Daily 11am–2am (Sun til 12am)", popularity: 72, sample: true,
      deals: [
        { id: "sp1", title: "50¢ wings", type: "food", kind: "wings", days: [3], start: "17:00", end: "22:00", score: 5, finePrint: "Dine-in, minimum 10." },
        { id: "sp2", title: "$10 domestic buckets", type: "drinks", kind: "beer", days: [0], start: "12:00", end: "23:00", score: 4, finePrint: "" },
        { id: "sp3", title: "$3 wells & drafts", type: "happyhour", kind: "wells", days: [1, 2, 3, 4, 5], start: "16:00", end: "19:00", score: 4, finePrint: "" }
      ] },
    { id: "stardust", name: "Stardust Karaoke Bar", address: "175 E Clayton St, Athens, GA 30601", lat: 33.9590, lng: -83.3762, age: "21+", cover: "No cover", hours: "Tue–Sun 7pm–2am (Sun 11am–12am)", popularity: 68, sample: true,
      deals: [
        { id: "sd1", title: "Karaoke all night + $3 shots", type: "events", kind: "karaoke", days: [2, 4], start: "21:00", end: "02:00", score: 4, finePrint: "" },
        { id: "sd2", title: "$4 mimosas", type: "drinks", kind: "mimosas", days: [0], start: "11:00", end: "16:00", score: 3, finePrint: "" }
      ] },
    { id: "anchor-ivy", name: "Anchor & Ivy", address: "215 N Lumpkin St, Athens, GA 30601", lat: 33.9592, lng: -83.3786, age: "21+", cover: "$5 Fri–Sat after 10pm", hours: "Wed–Sat 8pm–2am", popularity: 83, sample: true,
      deals: [
        { id: "ai1", title: "$4 vodka sodas", type: "drinks", kind: "cocktails", days: [3, 4], start: "21:00", end: "00:00", score: 4, finePrint: "" },
        { id: "ai2", title: "No cover before 10", type: "nocover", kind: "cover", days: [5, 6], start: "20:00", end: "22:00", score: 3, finePrint: "" },
        { id: "ai3", title: "Late-night $5 cheesesteaks", type: "food", kind: "food", days: [5, 6], start: "23:00", end: "02:00", score: 4, finePrint: "From the kitchen window out back." }
      ] },
    { id: "low-tide", name: "Low Tide Dive", address: "330 W Hancock Ave, Athens, GA 30601", lat: 33.9612, lng: -83.3790, age: "21+", cover: "No cover", hours: "Mon–Sat 2pm–2am", popularity: 58, sample: true,
      deals: [
        { id: "lo1", title: "$2 PBR all day", type: "drinks", kind: "beer", days: [1, 2, 3, 4, 5, 6], start: "14:00", end: "02:00", score: 3, finePrint: "" },
        { id: "lo2", title: "Open mic + $3 wells", type: "events", kind: "music", days: [1], start: "20:00", end: "23:00", score: 3, finePrint: "Sign-up at 7:30." }
      ] },
    { id: "firefly", name: "Firefly Wine Bar", address: "270 E Washington St, Athens, GA 30601", lat: 33.9583, lng: -83.3746, age: "21+", cover: "No cover", hours: "Mon–Sat 4pm–12am", popularity: 50, sample: true,
      deals: [
        { id: "ff1", title: "Half-price glasses", type: "happyhour", kind: "wine", days: [1, 2, 3, 4, 5, 6], start: "16:00", end: "19:00", score: 4, finePrint: "" },
        { id: "ff2", title: "Cheese board + bottle for $30", type: "food", kind: "food", days: [4], start: "17:00", end: "22:00", score: 3, finePrint: "" }
      ] }
  ]
};
