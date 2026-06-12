import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function toCSV(headers: string[], rows: string[][]): string {
  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`
  const lines = [headers.map(escape).join(',')]
  for (const row of rows) {
    lines.push(row.map(escape).join(','))
  }
  return lines.join('\n')
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')

  if (type === 'clientes') {
    const data = await prisma.cliente.findMany({ orderBy: { createdAt: 'desc' } })
    const headers = ['ID', 'Nome', 'Telefone', 'Email', 'Veículo', 'Placa', 'Criado em']
    const rows = data.map(c => [
      c.id,
      c.nome,
      c.telefone ?? '',
      c.email ?? '',
      c.veiculo ?? '',
      c.placa ?? '',
      new Date(c.createdAt).toLocaleDateString('pt-BR'),
    ])
    const csv = toCSV(headers, rows)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=clientes.csv',
      },
    })
  }

  if (type === 'mecanicos') {
    const data = await prisma.mecanico.findMany({ orderBy: { createdAt: 'desc' } })
    const headers = ['ID', 'Nome', 'Comissão (%)', 'Criado em']
    const rows = data.map(m => [
      m.id,
      m.nome,
      m.comissao.toString(),
      new Date(m.createdAt).toLocaleDateString('pt-BR'),
    ])
    const csv = toCSV(headers, rows)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=mecanicos.csv',
      },
    })
  }

  if (type === 'servicos') {
    const data = await prisma.servico.findMany({
      include: { cliente: true, mecanico: true },
      orderBy: { createdAt: 'desc' },
    })
    const headers = [
      'ID', 'Cliente', 'Mecânico', 'Descrição', 'Status',
      'Mão de Obra (R$)', 'Peças (R$)', '% Peças', 'Observações', 'Criado em',
    ]
    const statusLabel: Record<string, string> = {
      aguardando_orcamento: 'Aguardando Orçamento',
      aguardando_peca: 'Aguardando Peça',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
    }
    const rows = data.map(s => [
      s.id,
      s.cliente.nome,
      s.mecanico?.nome ?? '',
      s.descricao,
      statusLabel[s.status] ?? s.status,
      s.valorMaoDeObra.toFixed(2),
      s.valorPecas.toFixed(2),
      s.percentualPecas.toFixed(2),
      s.observacoes ?? '',
      new Date(s.createdAt).toLocaleDateString('pt-BR'),
    ])
    const csv = toCSV(headers, rows)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=servicos.csv',
      },
    })
  }

  if (type === 'fluxo-caixa') {
    const data = await prisma.fluxoCaixa.findMany({
      include: { servico: true },
      orderBy: { data: 'desc' },
    })
    const headers = ['ID', 'Tipo', 'Descrição', 'Categoria', 'Valor (R$)', 'Serviço', 'Data']
    const rows = data.map(f => [
      f.id,
      f.tipo === 'entrada' ? 'Entrada' : 'Saída',
      f.descricao,
      f.categoria,
      f.valor.toFixed(2),
      f.servico?.descricao ?? '',
      new Date(f.data).toLocaleDateString('pt-BR'),
    ])
    const csv = toCSV(headers, rows)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=fluxo-caixa.csv',
      },
    })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
