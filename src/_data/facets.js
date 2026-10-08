// The ways prayers can be browsed. Each prayer lists its labels in its front matter
// (for example `occasions: [Marriage]`). A new label works automatically;
// add it here only to give it a description or a place in the order.

export default [
  {
    key: "occasions",
    label: "Occasions",
    path: "occasion",
    order: [
      "Church Service",
      "Home & Family",
      "Marriage",
      "Sickness & Death",
      "Times of Trouble",
      "Nation & Elections",
      "Work & Vocation",
    ],
    descriptions: {
      "Church Service": "Prayers for use at the Divine Service: on entering the church, before worship, and on departing.",
      "Home & Family": "Prayers and devotions for households: around the table, at the holidays, and in the rhythms of family life.",
      "Marriage": "For couples, the engaged, and the wedding day.",
      "Sickness & Death": "For the sick, the suffering, and those who keep watch at the deathbed.",
      "Times of Trouble": "When the world is shaken and we flee to the mercy of God.",
      "Nation & Elections": "For our country, those in authority, and the days of elections.",
      "Work & Vocation": "For our callings and the tools we use in them.",
    },
  },
  {
    key: "types",
    label: "Kinds of Prayer",
    path: "kind",
    order: ["Prayer", "Litany", "Liturgy", "Rite", "Order of Prayer", "Devotion", "Guide"],
    descriptions: {
      "Prayer": "Collects and prayers to be prayed alone or together.",
      "Litany": "Responsive prayers: the leader prays and all answer.",
      "Liturgy": "Short orders of Scripture, prayer, and song for particular occasions.",
      "Rite": "Orders for pastors and households to mark a blessing or a promise.",
      "Order of Prayer": "Simple patterns for daily prayer.",
      "Devotion": "Scripture, hymn, and prayer for the household.",
      "Guide": "Practical help for praying in particular situations.",
    },
  },
  {
    key: "seasons",
    label: "Seasons & Holidays",
    path: "season",
    order: ["Advent", "Christmas", "Circumcision & Name of Jesus", "New Year", "Epiphany", "Lent", "Holy Week", "Easter", "Pentecost", "Thanksgiving"],
    descriptions: {
      "Christmas": "For the Feast of the Nativity of our Lord.",
      "Circumcision & Name of Jesus": "January 1, the eighth day of Christmas.",
      "New Year": "For the turning of the year.",
      "Thanksgiving": "For the national day of Thanksgiving.",
    },
  },
  {
    key: "source",
    label: "Source",
    path: "source",
    order: ["Pastor Wolfmueller", "Historic"],
    descriptions: {
      "Pastor Wolfmueller": "Prayers and orders written or adapted by Pastor Bryan Wolfmueller.",
      "Historic": "Prayers of the Church from earlier generations.",
    },
  },
];
