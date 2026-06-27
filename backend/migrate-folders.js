const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  let mainFolder = await prisma.folder.findFirst({ where: { name: 'Main' } });
  
  if (!mainFolder) {
    mainFolder = await prisma.folder.create({ data: { id: 'main-folder-id', name: 'Main' } });
  } else if (mainFolder.id !== 'main-folder-id') {
    console.log("Fixing incorrect Main folder ID...");
    const correctMain = await prisma.folder.upsert({
      where: { id: 'main-folder-id' },
      update: {},
      create: { id: 'main-folder-id', name: 'Main_temp' }
    });
    
    await prisma.message.updateMany({
      where: { folderId: mainFolder.id },
      data: { folderId: 'main-folder-id' }
    });
    
    await prisma.folder.delete({ where: { id: mainFolder.id } });
    
    await prisma.folder.update({
      where: { id: 'main-folder-id' },
      data: { name: 'Main' }
    });
  }

  await prisma.message.updateMany({
    where: { folderId: null },
    data: { folderId: 'main-folder-id' }
  });
  console.log("Migration complete.");
}
main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
