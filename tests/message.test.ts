import request from "supertest";
import app from "../src/index";
import { AppDataSource } from "../src/config/data-source";

let senderToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNlbmRlckBleGFtcGxlLmNvbSIsImlhdCI6MTc0NjAyOTk0MiwiZXhwIjoxNzQ2MTE2MzQyfQ.pgJtoSZrMHofps5xTXauiWZLqWS9QW-6t3BALEkUWdo";
let senderId: string;
let receiverId: string;
let volunteerId: string;
let messageId: string;

beforeAll(async () => {
  await AppDataSource.initialize();

  // Registrar y verificar sender
  const senderRes = await request(app).post("/auth/register").send({
    name: "Sender",
    lastName: "Test",
    email: "sender@example.com",
    password: "password123",
    wallet: "0x123456789sender",
  });

  senderId = senderRes.body.id;
  const verifySender = await request(app).get(
    `/auth/verify-email?token=${senderRes.body.verificationToken}`
  );
  console.log(verifySender);
  const loginSender = await request(app).post("/auth/login").send({
    email: "sender@example.com",
    password: "password123",
  });

  senderToken = loginSender.body.token;

  const receiverRes = await request(app).post("/auth/register").send({
    name: "Receiver",
    lastName: "Test",
    email: "receiver@example.com",
    password: "password123",
    wallet: "0x123456789receiver",
  });

  receiverId = receiverRes.body.id;
  await request(app).get(
    `/auth/verify-email?token=${receiverRes.body.verificationToken}`
  );

  const volunteerRes = await request(app)
    .post("/volunteers")
    .set("Authorization", `Bearer ${senderToken}`)
    .send({
      name: "Clean the beach",
      description: "Beach cleanup in the city",
      requirements: "Gloves and bags",
      projectId: "4eea5354-7b34-462c-b615-4a29913db55d",
    });

  volunteerId = volunteerRes.body.id;
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe("Messaging API", () => {
  it("should send a message between users within a volunteer context", async () => {
    const res = await request(app)
      .post("/messages")
      .send({
        content: "¡Hola! ¿Cómo estás?",
        senderId: senderId,
        receiverId: receiverId,
        volunteerId: volunteerId,
      })
      .set("Authorization", `Bearer ${senderToken}`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.content).toBe("¡Hola! ¿Cómo estás?");

    messageId = res.body.id;
    console.log(messageId);
  });

  it("should retrieve messages by volunteer ID", async () => {
    const res = await request(app)
      .get(`/messages?volunteerId=${volunteerId}`)
      .set("Authorization", `Bearer ${senderToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("content");
    expect(res.body[0]).toHaveProperty("sender");
    expect(res.body[0]).toHaveProperty("receiver");
  });

  it("should not send message without receiverId or volunteerId", async () => {
    const res = await request(app)
      .post("/messages")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        content: "Esto debería fallar",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
