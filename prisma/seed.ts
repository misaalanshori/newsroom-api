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

    // --- Casbin Policies (moved from policy.conf) ---
    // Clear existing rules first
    await prisma.casbinRule.deleteMany({});

    // Role hierarchy (g rules)
    const roleHierarchy = [
        { ptype: 'g', v0: 'super-admin', v1: 'admin' },
        { ptype: 'g', v0: 'admin', v1: 'editor' },
        { ptype: 'g', v0: 'editor', v1: 'reader' },
    ];

    // Permission policies (p rules)
    // Format: ptype, role, resource, scope, ownership, action
    const policies = [
        // News
        { ptype: 'p', v0: 'reader', v1: 'news', v2: 'global', v3: 'any', v4: 'read' },
        { ptype: 'p', v0: 'reader', v1: 'department', v2: 'global', v3: 'any', v4: 'read' },
        { ptype: 'p', v0: 'editor', v1: 'news', v2: 'department', v3: 'own', v4: 'write' },
        { ptype: 'p', v0: 'admin', v1: 'news', v2: 'department', v3: 'any', v4: 'write' },
        { ptype: 'p', v0: 'super-admin', v1: 'news', v2: 'global', v3: 'any', v4: 'write' },
        { ptype: 'p', v0: 'super-admin', v1: 'department', v2: 'global', v3: 'any', v4: 'write' },
        // User
        { ptype: 'p', v0: 'reader', v1: 'user', v2: 'global', v3: 'own', v4: 'read' },
        { ptype: 'p', v0: 'reader', v1: 'user', v2: 'global', v3: 'own', v4: 'write' },
        { ptype: 'p', v0: 'super-admin', v1: 'user', v2: 'global', v3: 'any', v4: 'read' },
        { ptype: 'p', v0: 'super-admin', v1: 'user', v2: 'global', v3: 'any', v4: 'write' },
        { ptype: 'p', v0: 'super-admin', v1: 'user', v2: 'global', v3: 'any', v4: 'write:sensitive' },
        // Role
        { ptype: 'p', v0: 'super-admin', v1: 'role', v2: 'global', v3: 'any', v4: 'read' },
        // Policy Management
        { ptype: 'p', v0: 'super-admin', v1: 'policy', v2: 'global', v3: 'any', v4: 'read' },
        { ptype: 'p', v0: 'super-admin', v1: 'policy', v2: 'global', v3: 'any', v4: 'write' },
    ];

    await prisma.casbinRule.createMany({
        data: [...roleHierarchy, ...policies],
    });
    console.log(`✅ Created ${roleHierarchy.length + policies.length} Casbin rules`);

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
