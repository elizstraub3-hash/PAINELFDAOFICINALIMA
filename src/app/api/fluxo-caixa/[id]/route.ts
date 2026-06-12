import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const fluxo = await prisma.fluxoCaixa.findUnique({
    where: { id: params.id },
    include: { servico: true },
  })
  if (!fluxo) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(fluxo)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const fluxo = await prisma.fluxoCaixa.update({
    where: { id: params.id },
    data: body,
    include: { servico: true },
  })
  return NextResponse.json(fluxo)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.fluxoCaixa.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
