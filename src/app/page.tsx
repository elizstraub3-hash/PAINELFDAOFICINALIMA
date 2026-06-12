'use client'
import { useEffect, useState } from 'react'
import { Wrench, Clock, Play, CheckCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface Servico {
  id: string
  descricao: string
  status: string
  valorMaoDeObra: number
  valorPecas: number
  createdAt: string
  cliente: { nome: string }
  mecanico?: { nome: string }
}

interface FluxoCaixa {
  id: string
  tipo: string
  valor: number
}

const statusConfig: Record<string, { label: string; className: string }> = {
  aguardando_orcamento: { label: 'Aguardando Orçamento', className: 'bg-yellow-100 text-yellow-800' },
  aguardando_peca: { label: 'Aguardando Peça', className: 'bg-orange-100 text-orange-800' },
  em_andamento: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-800' },
  concluido: { label: 'Concluído', className: 'bg-green-100 text-green-800' },
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DashboardPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [fluxos, setFluxos] = useState<FluxoCaixa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/servicos').then(r => r.json()),
      fetch('/api/fluxo-caixa').then(r => r.json()),
    ]).then(([s, f]) => {
      setServicos(s)
      setFluxos(f)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const total = servicos.length
  const aguardando = servicos.filter(s => s.status === 'aguardando_orcamento').length
  const emAndamento = servicos.filter(s => s.status === 'em_andamento').length
  const concluidos = servicos.filter(s => s.status === 'concluido').length

  const entradas = fluxos.filter(f => f.tipo === 'entrada').reduce((acc, f) => acc + f.valor, 0)
  const saidas = fluxos.filter(f => f.tipo === 'saida').reduce((acc, f) => acc + f.valor, 0)
  const saldo = entradas - saidas

  const recent = servicos.slice(0, 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><Wrench className="text-blue-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Total Serviços</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-lg"><Clock className="text-yellow-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Aguardando Orçamento</p>
            <p className="text-2xl font-bold text-gray-900">{aguardando}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><Play className="text-blue-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Em Andamento</p>
            <p className="text-2xl font-bold text-gray-900">{emAndamento}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg"><CheckCircle className="text-green-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Concluídos</p>
            <p className="text-2xl font-bold text-gray-900">{concluidos}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg"><TrendingUp className="text-green-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Total Entradas</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(entradas)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg"><TrendingDown className="text-red-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Total Saídas</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(saidas)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><DollarSign className="text-blue-600" size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Saldo</p>
            <p className={`text-xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(saldo)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Serviços Recentes</h2>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum serviço cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mecânico</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map(s => {
                  const cfg = statusConfig[s.status] ?? { label: s.status, className: 'bg-gray-100 text-gray-800' }
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.cliente.nome}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{s.descricao}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.mecanico?.nome ?? '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(s.valorMaoDeObra + s.valorPecas)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
