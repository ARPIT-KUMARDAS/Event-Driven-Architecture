import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";


export async function POST(request: Request) {
   const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error("Please add webhook secret in env");
    }

    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occured -No Svix header")
    }

    const Payload = await request.json()
    const body = JSON.stringify(Payload);

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt :WebhookEvent

    try {
        evt = wh.verify(body,{
            "svix-id": "svix_id",
            "svix-timestamp": "svix_timestamp",
            "svix-signature": "svix_signature"
        }
        )as WebhookEvent;
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occured", { status: 400 });
    }

    const {id} = evt.data
    const eventType = evt.type;


    //logs

    if (eventType === "user.created") {
        try {
            const { email_addresses, primary_email_address_id } = evt.data;

         //log practice

         //optional
         const primaryEmail = email_addresses.find(
            (email) => email.id === primary_email_address_id
        );

        if (!primaryEmail) {
            return new Response("Primary email not found", { status: 400 });
        }

        //create a user in neon (post)

        const newUser = await prisma.user.create({
            data: {
                id: evt.data.id!,
                email: primaryEmail.email_address,
                issubscribed: false,
            }
        });

        console.log("User created:", newUser);


        } catch (error) {
            return new Response("Error creating user in database", { status: 400 });
        }
    }

    return new Response("webhook received successfully", { status: 200 });
   
}

