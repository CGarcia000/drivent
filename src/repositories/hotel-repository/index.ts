import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    }
  });
}

async function findRoomIdWithBooking(id: number) {
  return prisma.room.findFirst({
    where: {
      id,
    },
    include: {
      Booking: true,
    }
  });
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
  findRoomIdWithBooking,
};

export default hotelRepository;
