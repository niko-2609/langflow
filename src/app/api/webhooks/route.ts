import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";


export async function POST(req: Request) {
    const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!secret) return new Response("Missing secret", { status: 500 });


    const wh = new Webhook(secret);
    const body = await req.text();
    const headerPayload = await headers();

    const event = wh.verify(body, {
        "svix-id": headerPayload.get("svix-id")!,
        "svix-timestamp": headerPayload.get("svix-timestamp")!,
        "svix-signature": headerPayload.get("svix-signature")!,
    }) as WebhookEvent;

    console.log("Event from clerk", event.type)



    // Add new users to db when they sign up
    if (event.type === "user.created") {

        console.log("Event Data:", event.data)
        const { id, email_addresses, first_name, last_name, image_url} = event.data;

        
        // await prisma.user.upsert({
        //   where: { clerkId: id },
        //   update: {},
        //   create: {
        //     clerkId: id,
        //     id: id,
        //     email: email_addresses[0].email_address,
        //     firstName: first_name,
        //     lastName: last_name,
        //     imageUrl: image_url,
        //   },
        // });



        try {
          await prisma.user.upsert({
            where: { clerkId: id },
            update: {},
            create: {
              clerkId: id,
              id: id,
              email: email_addresses[0].email_address,
              firstName: first_name,
              lastName: last_name,
              imageUrl: image_url,
            },
          });
          console.log("User created successfully in DB");
        } catch (err) {
          console.error("Prisma upsert failed", err);
        }
        
      }




      return new Response("OK");
}