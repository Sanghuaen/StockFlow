import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const names = ['Electronics', 'Office Supplies', 'Accessories', 'Packaging', 'Other'];
  for (const name of names) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

main()
  .then(() => console.log('StockFlow categories seeded safely.'))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
