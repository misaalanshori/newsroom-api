import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // Create roles
    const roles = await Promise.all([
        prisma.role.upsert({
            where: { slug: 'reader' },
            update: {},
            create: { name: 'Reader', slug: 'reader' },
        }),
        prisma.role.upsert({
            where: { slug: 'editor' },
            update: {},
            create: { name: 'Editor', slug: 'editor' },
        }),
        prisma.role.upsert({
            where: { slug: 'admin' },
            update: {},
            create: { name: 'Admin', slug: 'admin' },
        }),
        prisma.role.upsert({
            where: { slug: 'super-admin' },
            update: {},
            create: { name: 'Super Admin', slug: 'super-admin' },
        }),
    ]);
    console.log(`✅ Created ${roles.length} roles`);

    // Create departments
    const departments = await Promise.all([
        prisma.department.upsert({
            where: { slug: 'general' },
            update: {},
            create: { name: 'General', slug: 'general' },
        }),
        prisma.department.upsert({
            where: { slug: 'technology' },
            update: {},
            create: { name: 'Technology', slug: 'technology' },
        }),
        prisma.department.upsert({
            where: { slug: 'sports' },
            update: {},
            create: { name: 'Sports', slug: 'sports' },
        }),
    ]);
    console.log(`✅ Created ${departments.length} departments`);

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
