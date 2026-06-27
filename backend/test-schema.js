const { z } = require("zod");
const chatPayloadSchema = z.object({
  id: z.string(),
  content: z.string().max(10_000).optional().nullable(),
  replyToId: z.string().optional().nullable(),
  media: z.array(z.object({
    url: z.string(),
    type: z.string()
  })).optional().nullable()
});

try {
  chatPayloadSchema.parse({
    id: "123",
    content: "",
    media: [{ url: "/uploads/123.jpg", type: "image" }]
  });
  console.log("Success");
} catch (e) {
  console.log("Error:", e);
}
