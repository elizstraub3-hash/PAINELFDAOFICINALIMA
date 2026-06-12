import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const mecanicos = await prisma.mecanico.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(mecanicos)
}

export async function POST(request: Request) {
  const body = await request.json()
  const mecanico = await prisma.mecanico.create({ data: body })
  return NextResponse.json(mecanico, { status: 201 })
}
