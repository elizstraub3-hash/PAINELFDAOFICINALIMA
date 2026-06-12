import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const clientes = await prisma.cliente.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(clientes)
}

export async function POST(request: Request) {
  const body = await request.json()
  const cliente = await prisma.cliente.create({ data: body })
  return NextResponse.json(cliente, { status: 201 })
}
