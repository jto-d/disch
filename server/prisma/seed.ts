import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data so seed is idempotent.
  await prisma.vote.deleteMany();
  await prisma.market.deleteMany();
  await prisma.attendee.deleteMany();
  await prisma.voter.deleteMany();

  const [jake, mia, connor] = await Promise.all([
    prisma.attendee.create({ data: { name: "Jake" } }),
    prisma.attendee.create({ data: { name: "Mia" } }),
    prisma.attendee.create({ data: { name: "Connor" } }),
  ]);

  const now = Date.now();

  await prisma.market.create({
    data: {
      question: "Will Jake throw up before midnight?",
      type: "YES_NO",
      closeAt: new Date(now + 1000 * 60 * 60 * 2), // closes in 2h
    },
  });

  await prisma.market.create({
    data: {
      question: "Who will drink the most tonight?",
      type: "PICK_PERSON",
      closeAt: new Date(now + 1000 * 60 * 45), // closes in 45m
    },
  });

  console.log("Seeded:", { jake: jake.id, mia: mia.id, connor: connor.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
