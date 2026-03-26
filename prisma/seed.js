const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Clean (dev only)
  await prisma.maintenanceRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.tenantProfile.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const landlordPasswordHash = await bcrypt.hash("landlord123", 10);
  const tenantPasswordHash = await bcrypt.hash("tenant123", 10);

  const landlord = await prisma.user.create({
    data: {
      email: "landlord@test.com",
      passwordHash: landlordPasswordHash,
      role: "LANDLORD",
    },
  });

  const tenant = await prisma.user.create({
    data: {
      email: "tenant@test.com",
      passwordHash: tenantPasswordHash,
      role: "TENANT",
    },
  });

  // Create sample property
  const property = await prisma.property.create({
    data: {
      name: "Sample Property",
      address: "Berlin, Sample Street 1",
      landlordId: landlord.id,
    },
  });

  // Link tenant to landlord + property
  await prisma.tenantProfile.create({
    data: {
      userId: tenant.id,
      landlordId: landlord.id,
      propertyId: property.id,
    },
  });

  // Create sample payment
  await prisma.payment.create({
    data: {
      month: "2026-07",
      amount: 1200,
      status: "PENDING",
      landlordId: landlord.id,
      tenantId: tenant.id,
      propertyId: property.id,
    },
  });

  // Create sample maintenance request
  await prisma.maintenanceRequest.create({
    data: {
      title: "Leaking faucet",
      description: "Kitchen sink is leaking under the cabinet.",
      status: "OPEN",
      landlordId: landlord.id,
      tenantId: tenant.id,
      propertyId: property.id,
    },
  });

  console.log("Seed complete:");
  console.log("Landlord login: landlord@test.com / landlord123");
  console.log("Tenant login: tenant@test.com / tenant123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });