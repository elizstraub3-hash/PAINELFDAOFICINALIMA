import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const servicos = await prisma.servico.findMany({
    include: { cliente: true, mecanico: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(servicos)
}

export async function POST(request: Request) {
  const body = await request.json()
  const servico = await prisma.servico.create({
    data: body,
    include: { cliente: true, mecanico: true },
  })
  return NextResponse.json(servico, { status: 201 })
}
