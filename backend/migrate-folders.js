const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  let mainFolder = await prisma.folder.findUnique({ where: { name: 'Main' } });
  if (!mainFolder) {
    mainFolder = await prisma.folder.create({ data: { name: 'Main' } });
  }
  await prisma.message.updateMany({
    where: { folderId: null },
    data: { folderId: mainFolder.id }
  });
  console.log("Migration complete.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
