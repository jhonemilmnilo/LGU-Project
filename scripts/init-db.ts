import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')
  
  // Maintenance Mode
  await prisma.systemSetting.upsert({
    where: { key: 'maintenance_mode' },
    update: {},
    create: {
      key: 'maintenance_mode',
      value: 'false',
      description: 'Global maintenance mode toggle (true/false)'
    }
  })

  // Site Logo
  await prisma.systemSetting.upsert({
    where: { key: 'site_logo' },
    update: {},
    create: {
      key: 'site_logo',
      value: '', // Let it be empty first so it uses the component default icon if not set
      description: 'Primary website logo URL'
    }
  })

  // Hero Slide 1
  await prisma.heroSlide.upsert({
    where: { id: 'initial-hero' },
    update: {
        title: 'Welcome To Mapandan',
        subtitle: 'Discover the pristine beauty of the Umbrella Rocks, our vibrant community, and the rich heritage of our municipality.',
        tagline: 'The Home of the Umbrella Rocks',
        imageUrl: '/agno_hero_cinematic_coastline.png',
        order: 0,
        isActive: true,
        primaryBtnText: 'Explore Tourism',
        primaryBtnLink: '/#tourism',
        secondaryBtnText: 'Municipal Services',
        secondaryBtnLink: '/#hotlines'
    },
    create: {
      id: 'initial-hero',
      title: 'Welcome To Mapandan',
      subtitle: 'Discover the pristine beauty of the Umbrella Rocks, our vibrant community, and the rich heritage of our municipality.',
      tagline: 'The Home of the Umbrella Rocks',
      imageUrl: '/agno_hero_cinematic_coastline.png',
      order: 0,
      isActive: true,
      primaryBtnText: 'Explore Tourism',
      primaryBtnLink: '/#tourism',
      secondaryBtnText: 'Municipal Services',
      secondaryBtnLink: '/#hotlines'
    }
  })

  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
