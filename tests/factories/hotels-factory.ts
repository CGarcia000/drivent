import faker from "@faker-js/faker";
import { prisma } from "@/config";

//Sabe criar objetos - Hotel do banco
export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    }
  });
}

export async function createRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: "1020",
      capacity: 3,
      hotelId: hotelId,
    }
  });
}

export async function createRandomRoomWithHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: String(faker.datatype.number({ min: 100, max: 9999 })),
      capacity: faker.datatype.number({ min: 1, max: 5 }),
      hotelId: hotelId,
    }
  });
}

export async function createRoomWithOneCapacity(hotelId: number) {
  return prisma.room.create({
    data: {
      name: "1020",
      capacity: 1,
      hotelId: hotelId,
    }
  });
}
