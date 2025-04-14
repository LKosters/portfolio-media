"use client"

import { X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Project {
  id: number
  title: string
  description: string
  image: string
  details: string
  color?: string
}

interface PortfolioModalProps {
  project: Project
  onClose: () => void
}

export default function PortfolioModal({ project, onClose }: PortfolioModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <Card
        className="w-full max-w-2xl mx-4 overflow-hidden border-4 border-black"
        style={{ backgroundColor: project.color || "white" }}
      >
        <CardHeader className="relative">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-white text-2xl font-bold">{project.title}</CardTitle>
          <CardDescription className="text-white/80">{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="bg-white p-4 rounded-md m-4">
          <div className="relative w-full h-64 mb-4">
            <Image
              src={project.image || "/placeholder.svg"}
              alt={project.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <p className="text-sm text-gray-700">{project.details}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>View Project</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
