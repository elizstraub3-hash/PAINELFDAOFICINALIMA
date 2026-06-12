import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const mecanico = await prisma.mecanico.findUnique({ where: { id: params.id } })
  if (!mecanico) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(mecanico)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const mecanico = await prisma.mecanico.update({ where: { id: params.id }, data: body })
  return NextResponse.json(mecanico)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.mecanico.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
