'use client'
import { Download, FileText } from 'lucide-react'

const EXPORTS = [
  { type: 'servicos', label: 'Serviços', desc: 'Todos os serviços com status, valores e mecânicos', color: 'blue' },
  { type: 'clientes', label: 'Clientes', desc: 'Lista de clientes com veículos e contatos', color: 'green' },
  { type: 'mecanicos', label: 'Mecânicos', desc: 'Mecânicos e suas comissões', color: 'purple' },
  { type: 'fluxo-caixa', label: 'Fluxo de Caixa', desc: 'Todos os lançamentos financeiros', color: 'orange' },
]

const COLORS: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  green: 'bg-green-50 border-green-200 hover:bg-green-100',
  purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
}
const ICON_COLORS: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
}

function download(type: string) {
  const a = document.createElement('a')
  a.href = `/api/export?type=${type}`
  a.download = `${type}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export default function ExportarPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Exportar Dados</h2>
      <p className="text-gray-500 text-sm mb-6">Exporte todos os seus dados em formato CSV para planilhas.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPORTS.map(({ type, label, desc, color }) => (
          <div key={type} className={`border rounded-xl p-5 cursor-pointer transition-colors ${COLORS[color]}`} onClick={() => download(type)}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${ICON_COLORS[color]}`}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{label}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
              <Download size={18} className="text-gray-400 mt-1" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 border rounded-xl p-5">
        <h3 className="font-medium text-gray-700 mb-2">Como usar</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Clique em qualquer bloco para baixar o CSV correspondente</li>
          <li>Os arquivos podem ser abertos no Excel, Google Planilhas ou LibreOffice</li>
          <li>Os valores monetários são exportados em reais (R$)</li>
          <li>As datas são formatadas no padrão brasileiro (DD/MM/AAAA)</li>
        </ul>
      </div>
    </div>
  )
}
