import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.image(),
    },
  });
}

export async function createRooms(hotelId: number) {
  await prisma.room.createMany({
    data: [
      {
        hotelId,
        name: faker.lorem.word(3),
        capacity: faker.datatype.number({ min: 1, max: 4 }),
      },
      {
        hotelId,
        name: faker.lorem.word(3),
        capacity: faker.datatype.number({ min: 1, max: 4 }),
      },
    ],
  });

  return prisma.room.findMany({
    where: { hotelId },
  });
}
