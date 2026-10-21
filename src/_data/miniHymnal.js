// The Mini Hymnal (printed as "The Mini-Hymnal 2.0: Comfort Book"). Each page lives in
// src/mini-hymnal/ and says which `section` it belongs to and its `order` within that section.

const book = {
  title: "Mini Hymnal",
  tagline: "Psalms, Scriptures, and prayers for use in the hospital, when traveling, and such.",
  compiler: "Compiled by Pastor Bryan Wolfmueller",
  cover: "/images/mini-hymnal/the-crucifixion-raphael.jpg",

  sections: [
    // `button` is the label on the Mini Hymnal's front page.
    { key: "devotion", title: "A Brief Order of Devotion", button: "Order of Devotion" },
    { key: "psalms", title: "Select Psalms", note: "King James Version" },
    { key: "john", title: "The Gospel of John", note: "World English Bible" },
    { key: "canticles", title: "Canticles" },
    { key: "hymns", title: "Hymns", note: "From The Lutheran Hymnal" },
    { key: "prayers", title: "Prayers" },
  ],

  // "About this book," from the front of the printed book.
  about: [
    "All of the resources in this book are in the public domain. This book may be copied, reproduced and distributed whole or in-part, in any way deemed helpful for the Gospel. Copies may be downloaded from <a href=\"https://www.wolfmueller.co/resources\">wolfmueller.co/resources</a>. Professionally printed versions of this book can be ordered from <a href=\"https://www.lulu.com\">lulu.com</a>.",
    "The Order of Devotion is modeled after the morning and evening taught by Luther in the Small Catechism, and is copied from the Around the Word Devotions. (Visit <a href=\"https://www.whatdoesthismean.org\">whatdoesthismean.org</a> to see and download free weekly devotions.)",
    "The Psalms and Canticles from the Scriptures are copied from the King James Version, 1611. The text of the <i>Gloria in Excelsis</i> and the <i>Te Deum Laudamus</i> are taken from the Book of Common Prayer.",
    "The Gospel of John is copied from the World English Bible, a text in the public domain. (Visit <a href=\"https://www.worldenglishbible.org\">worldenglishbible.org</a> for more information.)",
    "The hymns are copied from The Lutheran Hymnal (Copyright 1941), but are in the public domain. (Thanks to <a href=\"https://www.lutheran-hymnal.com\">lutheran-hymnal.com</a> for making these texts available.)",
    "The prayers are composed by Pastor Bryan Wolfmueller, and are released into the public domain for the sake of the Gospel and the Church.",
    "The painting on the cover is “The Crucifixion” by Raphael, 1502-1503, and is in the public domain. (Thanks to <a href=\"https://www.wikiart.org\">wikiart.org</a> for making the image available.)",
    "Thanks to Keri Wolfmueller and Pastor Mark Preus for help selecting hymns. Thanks to Lyndsay Johnson for preparing the melodies of the hymns. Thanks to the Fellows of the Doxology Collegium for their input and suggestions",
    "Please send comments, corrections, notes, or questions to Bryan Wolfmueller, <a href=\"mailto:bwolfmueller@gmail.com\">bwolfmueller@gmail.com</a>.",
  ],
};

// The parts with a page listing their contents (/mini-hymnal/psalms/ ...). The Order of
// Devotion and the Prayers are single pages, so their buttons open them directly.
book.listed = book.sections.filter((s) => !["devotion", "prayers"].includes(s.key));

export default book;
