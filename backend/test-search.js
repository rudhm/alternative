const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const msgs = await prisma.message.findMany({
    where: { content: { contains: "test", mode: "insensitive" } },
    take: 5
  });
  console.log(msgs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
