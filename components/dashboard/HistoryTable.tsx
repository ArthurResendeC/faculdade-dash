import type { ReactNode } from "react";
import type { HistoryItem } from "./types";

type HistoryTableProps = {
  history: HistoryItem[];
  onRestoreDatasetHistory: () => void;
};

const statusClass = {
  Alerta: "bg-[#f8e8e8] text-[#b73535]",
  Ok: "bg-[#e5f4ef] text-[#14845f]",
  Atenção: "bg-[#fff2d6] text-[#a76812]",
};

export function HistoryTable({ history, onRestoreDatasetHistory }: HistoryTableProps) {
  return (
    <section className="mt-[22px]" aria-label="Ultimas analises">
      <div className="mb-3 flex items-center justify-between gap-3.5">
        <h2 className="text-[1.08rem] font-bold text-[#17202a]">Últimas Análises e Registros da Base</h2>
        <button
          className="min-h-[34px] cursor-pointer rounded-lg border border-[#d9e0e8] bg-white px-3 font-extrabold text-[#607082]"
          type="button"
          onClick={onRestoreDatasetHistory}
        >
          Restaurar base
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#d9e0e8] bg-white shadow-[0_18px_50px_rgba(17,34,51,0.08)]">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr>
              <Th>Data</Th>
              <Th>Colaborador</Th>
              <Th>Risco Calculado</Th>
              <Th>Setor</Th>
              <Th>Turno</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <Td>{item.data}</Td>
                <Td>{item.colaborador}</Td>
                <Td>{item.risco}</Td>
                <Td>{item.setor}</Td>
                <Td>{item.turno}</Td>
                <Td>
                  <span
                    className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-[0.84rem] font-black ${
                      statusClass[item.status]
                    }`}
                  >
                    {item.status}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-[#d9e0e8] px-[18px] py-[15px] text-left text-xs font-extrabold uppercase tracking-normal text-[#607082]">
      {children}
    </th>
  );
}

function Td({ children }: { children: ReactNode }) {
  return <td className="border-b border-[#d9e0e8] px-[18px] py-[15px] text-left">{children}</td>;
}
