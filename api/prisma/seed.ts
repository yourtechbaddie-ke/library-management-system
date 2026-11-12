import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();
const genres = [
  { name: 'Fiction', description: 'Novels and short stories' },
  { name: 'Science Fiction', description: 'Speculative and futuristic storytelling' },
  { name: 'History', description: 'Non-fiction accounts of the past' },
  { name: 'Technology', description: 'Computing, engineering and software' },
  { name: 'Mystery', description: 'Crime, detective and suspense' },
];
const books = [
  ['Things Fall Apart','Chinua Achebe','9780385474542',1958,3,'Fiction'],
  ['Half of a Yellow Sun','Chimamanda Ngozi Adichie','9780007200283',2006,2,'Fiction'],
  ['The Kite Runner','Khaled Hosseini','9781594631931',2003,4,'Fiction'],
  ['Dune','Frank Herbert','9780441013593',1965,3,'Science Fiction'],
  ['Neuromancer','William Gibson','9780441569595',1984,2,'Science Fiction'],
  ['The Left Hand of Darkness','Ursula K. Le Guin','9780441478125',1969,2,'Science Fiction'],
  ['Sapiens','Yuval Noah Harari','9780062316110',2011,5,'History'],
  ['Guns, Germs, and Steel','Jared Diamond','9780393317558',1997,2,'History'],
  ['The Fate of Africa','Martin Meredith','9781610396356',2005,2,'History'],
  ['Clean Code','Robert C. Martin','9780132350884',2008,4,'Technology'],
  ['The Pragmatic Programmer','Andrew Hunt and David Thomas','9780135957059',2019,3,'Technology'],
  ['Designing Data-Intensive Applications','Martin Kleppmann','9781449373320',2017,3,'Technology'],
  ['The Hound of the Baskervilles','Arthur Conan Doyle','9780140437867',1902,2,'Mystery'],
  ['And Then There Were None','Agatha Christie','9780062073488',1939,3,'Mystery'],
  ['The Girl with the Dragon Tattoo','Stieg Larsson','9780307454546',2005,2,'Mystery'],
  ['Gone Girl','Gillian Flynn','9780307588371',2012,3,'Mystery'],
] as const;
async function main() {
  const genreIds: Record<string, number> = {};
  for (const genre of genres) {
    const row = await prisma.genre.upsert({ where: { name: genre.name }, update: { description: genre.description }, create: genre });
    genreIds[genre.name] = row.id;
  }
  for (const [title, author, isbn, publishedYear, copies, genre] of books) {
    await prisma.book.upsert({ where: { isbn }, update: { title, author, publishedYear, copies, genreId: genreIds[genre] }, create: { title, author, isbn, publishedYear, copies, genreId: genreIds[genre] } });
  }
  const librarian = await prisma.user.upsert({ where: { email: 'librarian@example.com' }, update: { name: 'Lena Librarian', role: Role.LIBRARIAN }, create: { email: 'librarian@example.com', name: 'Lena Librarian', role: Role.LIBRARIAN } });
  const patron = await prisma.user.upsert({ where: { email: 'patron@example.com' }, update: { name: 'Pat Patron', role: Role.PATRON }, create: { email: 'patron@example.com', name: 'Pat Patron', role: Role.PATRON } });
  const dune = await prisma.book.findUniqueOrThrow({ where: { isbn: '9780441013593' } });
  const clean = await prisma.book.findUniqueOrThrow({ where: { isbn: '9780132350884' } });
  for (const review of [
    { bookId: dune.id, userId: patron.id, rating: 5, comment: 'A towering classic.' },
    { bookId: clean.id, userId: patron.id, rating: 4, comment: 'Practical and opinionated.' },
    { bookId: clean.id, userId: librarian.id, rating: 5 },
  ]) {
    await prisma.review.upsert({ where: { bookId_userId: { bookId: review.bookId, userId: review.userId } }, update: { rating: review.rating, comment: review.comment }, create: review });
  }
  console.log(`Seeded ${genres.length} genres, ${books.length} books, 2 users and 3 reviews.`);
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
