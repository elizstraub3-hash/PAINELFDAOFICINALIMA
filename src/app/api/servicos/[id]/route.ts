import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const servico = await prisma.servico.findUnique({
    where: { id: params.id },
    include: { cliente: true, mecanico: true },
  })
  if (!servico) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(servico)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const servico = await prisma.servico.update({
    where: { id: params.id },
    data: body,
    include: { cliente: true, mecanico: true },
  })
  return NextResponse.json(servico)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.servico.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
