import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const filePath = path.join(process.cwd(), "content/portfolio", `${projectId}.md`)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const content = fs.readFileSync(filePath, "utf-8")
    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error reading portfolio content:", error)
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 }
    )
  }
} 