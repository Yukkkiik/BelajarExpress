const prisma = require('../src/config/db');
const bcrypt = require('bcrypt');


async function main() {
  console.log('🌱 Starting seed...');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fashion.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@fashion.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create Customer Users
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'customer1@example.com',
      password: hashedPassword,
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'customer2@example.com',
      password: hashedPassword,
      role: 'CUSTOMER',
    },
  });

  // Create Seller Users
  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@fashion.com' },
    update: {},
    create: {
      name: 'Fashion Store 1',
      email: 'seller1@fashion.com',
      password: hashedPassword,
      role: 'SELLER',
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@fashion.com' },
    update: {},
    create: {
      name: 'Fashion Store 2',
      email: 'seller2@fashion.com',
      password: hashedPassword,
      role: 'SELLER',
    },
  });

  console.log('✅ Users created');

  // Create Categories
  const menCategory = await prisma.category.upsert({
    where: { name: 'Men' },
    update: {},
    create: { name: 'Men' },
  });

  const womenCategory = await prisma.category.upsert({
    where: { name: 'Women' },
    update: {},
    create: { name: 'Women' },
  });

  const accessoriesCategory = await prisma.category.upsert({
    where: { name: 'Accessories' },
    update: {},
    create: { name: 'Accessories' },
  });

  console.log('✅ Categories created');

  // Create Products
  const products = [
    {
      name: 'Classic White T-Shirt',
      description: 'Premium cotton white t-shirt for everyday wear',
      price: 299000,
      stock: 50,
      categoryId: menCategory.id,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    },
    {
      name: 'Slim Fit Jeans',
      description: 'Dark blue slim fit jeans with stretch fabric',
      price: 599000,
      stock: 30,
      categoryId: menCategory.id,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
    },
    {
      name: 'Floral Summer Dress',
      description: 'Lightweight floral dress perfect for summer',
      price: 450000,
      stock: 25,
      categoryId: womenCategory.id,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
    },
    {
      name: 'Elegant Blazer',
      description: 'Professional blazer for office and formal events',
      price: 899000,
      stock: 15,
      categoryId: womenCategory.id,
      image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f',
    },
    {
      name: 'Leather Handbag',
      description: 'Genuine leather handbag with multiple compartments',
      price: 1200000,
      stock: 10,
      categoryId: accessoriesCategory.id,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
    },
    {
      name: 'Sunglasses',
      description: 'UV protection sunglasses with polarized lenses',
      price: 350000,
      stock: 40,
      categoryId: accessoriesCategory.id,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
    },
    {
      name: 'Casual Sneakers',
      description: 'Comfortable sneakers for daily activities',
      price: 750000,
      stock: 35,
      categoryId: menCategory.id,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772',
    },
    {
      name: 'Silk Scarf',
      description: 'Luxury silk scarf with elegant pattern',
      price: 280000,
      stock: 20,
      categoryId: accessoriesCategory.id,
      image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26',
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('✅ Products created');

  // Create sample cart for customer1
  const cart = await prisma.cart.create({
    data: {
      userId: customer1.id,
    },
  });

  const firstProduct = await prisma.product.findFirst();
  if (firstProduct) {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: firstProduct.id,
        quantity: 2,
      },
    });
  }

  console.log('✅ Sample cart created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });