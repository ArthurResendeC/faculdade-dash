import { CalendarClock, Factory, Gauge, Loader2, MapPin, Moon, Sun } from "lucide-react";
import type { FormEvent } from "react";
import { setores, turnos, type Setor, type Turno } from "@/lib/prediction";

type EmployeeFormProps = {
  colaborador: string;
  idade: number;
  distancia: number;
  setor: Setor;
  turno: Turno;
  loading: boolean;
  onColaboradorChange: (value: string) => void;
  onIdadeChange: (value: number) => void;
  onDistanciaChange: (value: number) => void;
  onSetorChange: (value: Setor) => void;
  onTurnoChange: (value: Turno) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const turnoIcons = {
  Manhã: Sun,
  Tarde: CalendarClock,
  Noite: Moon,
};

export function EmployeeForm({
  colaborador,
  idade,
  distancia,
  setor,
  turno,
  loading,
  onColaboradorChange,
  onIdadeChange,
  onDistanciaChange,
  onSetorChange,
  onTurnoChange,
  onSubmit,
}: EmployeeFormProps) {
  return (
    <aside className="rounded-lg border border-[#d9e0e8] bg-white p-5 shadow-[0_18px_50px_rgba(17,34,51,0.08)] max-lg:col-span-full">
      <div className="mb-[18px] flex items-center gap-2.5">
        <Factory className="text-[#1769aa]" size={20} />
        <h2 className="text-base font-bold tracking-normal text-[#17202a]">Dados do Colaborador</h2>
      </div>

      <form onSubmit={onSubmit} className="grid gap-[18px]">
        <label className="grid gap-2">
          <span className="text-[0.86rem] font-bold text-[#607082]">Colaborador</span>
          <input
            className="min-h-[42px] w-full min-w-0 rounded-lg border border-[#d9e0e8] bg-[#f8fafc] px-3 text-[#17202a] outline-none"
            type="text"
            value={colaborador}
            onChange={(event) => onColaboradorChange(event.target.value)}
            maxLength={24}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-[0.86rem] font-bold text-[#607082]">Idade</span>
          <div className="grid grid-cols-[1fr_44px] items-center gap-2.5">
            <input
              className="accent-[#1769aa]"
              type="range"
              min="18"
              max="70"
              value={idade}
              onChange={(event) => onIdadeChange(Number(event.target.value))}
            />
            <strong className="grid min-h-[38px] place-items-center rounded-lg border border-[#d9e0e8] bg-[#f8fafc]">
              {idade}
            </strong>
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-[0.86rem] font-bold text-[#607082]">
            Distância Casa-Trabalho
          </span>
          <div className="grid min-h-[42px] grid-cols-[18px_1fr_28px] items-center gap-2.5 rounded-lg border border-[#d9e0e8] bg-[#f8fafc] px-3 text-[#607082]">
            <MapPin size={18} />
            <input
              className="w-full min-w-0 bg-transparent text-[#17202a] outline-none"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={distancia}
              onChange={(event) => onDistanciaChange(Number(event.target.value))}
            />
            <span>km</span>
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-[0.86rem] font-bold text-[#607082]">Setor</span>
          <select
            className="min-h-[42px] w-full min-w-0 rounded-lg border border-[#d9e0e8] bg-[#f8fafc] px-3 text-[#17202a] outline-none"
            value={setor}
            onChange={(event) => onSetorChange(event.target.value as Setor)}
          >
            {setores.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2">
          <span className="text-[0.86rem] font-bold text-[#607082]">Turno</span>
          <div className="grid grid-cols-3 gap-1.5 max-md:grid-cols-1" role="radiogroup" aria-label="Turno">
            {turnos.map((item) => {
              const Icon = turnoIcons[item];
              const active = turno === item;

              return (
                <button
                  key={item}
                  type="button"
                  className={`inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg border text-[0.88rem] font-extrabold ${
                    active
                      ? "border-[#1769aa] bg-[#e7f0f8] text-[#0f4f84]"
                      : "border-[#d9e0e8] bg-[#f8fafc] text-[#607082]"
                  }`}
                  onClick={() => onTurnoChange(item)}
                  aria-pressed={active}
                  title={item}
                >
                  <Icon size={16} />
                  <span>{item}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#1769aa] bg-[#1769aa] font-black uppercase text-white disabled:cursor-wait disabled:opacity-75"
          type="submit"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Gauge size={18} />}
          <span>{loading ? "Calculando" : "Calcular risco"}</span>
        </button>
      </form>
    </aside>
  );
}
