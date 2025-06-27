import { NextResponse } from "next/server";
import {auth} from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";


export async function POST() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //capture payment 
    try {
        await prisma.user.findUnique({where: {id: userId }});
    
      if (!userId) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });

      }
      const subscriptionEnds = new Date();
      subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

       const updateUser = await prisma.user.update({ 
        where: { id: userId },
        data: {
            issubscribed: true,
            subscriptionEnds: subscriptionEnds,
        },
      });

      return NextResponse.json({ message: "Subscription updated successfully",
         subscriptionEnds: updateUser.subscriptionEnds }, { status: 200 });


    } catch (err) {
        console.error("Error updating subscription:", err);
        return NextResponse.json({ error: "Internal  Server error" }, { status: 500 });
        
    }
}




export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique(
            {where: {id: userId },
            select:{
                issubscribed: true,
                subscriptionEnds: true
            }

        },
        
        );
    
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });

      }

      const now = new Date();

      if(user.subscriptionEnds && user.subscriptionEnds < now) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                issubscribed: false,        
                subscriptionEnds: null
            }
        });

        return NextResponse.json({
            isSubscribed: false,
            subscriptionEnds: null
        });
      }

      return NextResponse.json({
        isSubscribed: user.issubscribed,
            subscriptionEnds: user.subscriptionEnds,
      });
    } catch (err) {
        console.error("Error updating subscription:", err);
        return NextResponse.json(
            { error: "Internal  Server error" },
             { status: 500 }
            );
        
    }


}