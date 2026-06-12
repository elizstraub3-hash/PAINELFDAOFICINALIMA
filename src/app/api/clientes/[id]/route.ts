import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cliente = await prisma.cliente.findUnique({ where: { id: params.id } })
  if (!cliente) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(cliente)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const cliente = await prisma.cliente.update({ where: { id: params.id }, data: body })
  return NextResponse.json(cliente)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await prisma.cliente.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
