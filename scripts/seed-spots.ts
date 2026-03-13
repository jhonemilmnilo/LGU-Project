import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const spots = [
    {
      name: "Umbrella Rocks",
      address: "Sabangan, Agno, Pangasinan",
      category: "Beach / Geological",
      description: "Agno's most iconic landmark, famed for mushroom-shaped rock formations sculpted by the relentless waves of the West Philippine Sea.",
      imageUrl: "/place_to_visits/umbrella_rocks.png",
      latitude: 16.114229,
      longitude: 119.796543,
      googleMapsUrl: "https://maps.app.goo.gl/Fkiw8PHYzdNVXEHA9",
      isPublished: true,
    },
    {
      name: "Sabangan Beach",
      address: "Sabangan, Agno, Pangasinan",
      category: "Beach",
      description: "Boasting crystal-clear turquoise waters and a diverse marine ecosystem, ideal for swimming and snorkeling.",
      imageUrl: "/place_to_visits/sabangan_beach.png",
      latitude: 16.115,
      longitude: 119.795,
      isPublished: true,
    },
    {
      name: "Abagatanen Beach",
      address: "Abagatanen, Agno, Pangasinan",
      category: "Beach",
      description: "A serene beach with golden-grey sand and calm blue waters, perfect for a peaceful camping getaway.",
      imageUrl: "/place_to_visits/abagatanen_beach.png",
      latitude: 16.083,
      longitude: 119.783,
      isPublished: true,
    },
    {
      name: "Death Pool",
      address: "Sabangan, Agno, Pangasinan",
      category: "Natural Pool",
      description: "A natural rock formation filled with sea water, creating an 'infinity pool' effect right beside the ocean waves.",
      imageUrl: "/place_to_visits/death_pool.png",
      latitude: 16.116,
      longitude: 119.797,
      isPublished: true,
    },
    {
      name: "Payad Beach",
      address: "Payad, Agno, Pangasinan",
      category: "Beach",
      description: "A tranquil and rustic beach destination with fine sand and coconut trees, away from the usual crowds.",
      imageUrl: "/place_to_visits/payad_beach.png",
      latitude: 16.101,
      longitude: 119.790,
      isPublished: true,
    }
  ]

  console.log('Clearing existing spots...')
  await prisma.tourismSpot.deleteMany()

  console.log('Seeding new spots...')
  for (const spot of spots) {
    await prisma.tourismSpot.create({
      data: spot
    })
  }

  console.log('Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
