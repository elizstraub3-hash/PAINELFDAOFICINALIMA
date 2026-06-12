import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const fluxos = await prisma.fluxoCaixa.findMany({
    include: { servico: true },
    orderBy: { data: 'desc' },
  })
  return NextResponse.json(fluxos)
}

export async function POST(request: Request) {
  const body = await request.json()
  const fluxo = await prisma.fluxoCaixa.create({
    data: body,
    include: { servico: true },
  })
  return NextResponse.json(fluxo, { status: 201 })
}
