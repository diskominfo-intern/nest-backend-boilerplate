import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@diskominfo.go.id' },
    update: {},
    create: {
      email: 'admin@diskominfo.go.id',
      name: 'Administrator',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@diskominfo.go.id' },
    update: {},
    create: {
      email: 'user@diskominfo.go.id',
      name: 'Pengguna Biasa',
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log(`Users created: ${admin.email}, ${user.email}`);

  // Seed Products
  const productsData = [
    { name: 'Laptop Asus ROG Strix G16', price: 25000000 },
    { name: 'Monitor LG UltraGear 27 Inch 144Hz', price: 4500000 },
    { name: 'Keyboard Mechanical Keychron K2', price: 1250000 },
    { name: 'Mouse Wireless Logitech MX Master 3S', price: 1500000 },
    { name: 'Headphone Wireless Sony WH-1000XM5', price: 4999000 },
    { name: 'Webcam Logitech C920 HD Pro', price: 1100000 },
    { name: 'Desk Pad Kulit Premium', price: 250000 },
  ];

  for (const prod of productsData) {
    const p = await prisma.product.create({
      data: prod,
    });
    console.log(`Product created: ${p.name} (ID: ${p.id}, Rp ${p.price.toLocaleString('id-ID')})`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
