import { NextRequest, NextResponse } from "next/server";
import {auth,currentUser} from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";


export async function DELETE(req: NextRequest,
     {params}: {params: {id: string}}
    ){
        const { userId } = await auth()

        if(!userId){
            return NextResponse.json({error: "Unauthorized"},{status: 401})
        }

        try{
            const todoId = params.id

           const todo=  await prisma.todo.findUnique({
                where: {id: todoId}
            })

            if(!todo){
                return NextResponse.json({error: "Todo Not fond"},{status:
                    401});
            }

            if(todo.userId !==userId){
                return NextResponse.json({error: "Forboden"},{status : 403})
            }

            await prisma.todo.delete({
                where: {id:todoId}
            })
            
            return NextResponse.json({message: "Todo deleted successfully"},{status: 200})

        } catch (err) {
          console.error("Error updating subscription:", err);
         return NextResponse.json(
            { error: "Internal  Server error" },
             { status: 500 }
            );
    }

}