import { NextResponse } from "next/server";
import { isSetor, isTurno, predictAbsenteeism, type PredictionInput } from "@/lib/prediction";

export const runtime = "nodejs";

function validatePayload(payload: Partial<PredictionInput>) {
  if (
    typeof payload.idade !== "number" ||
    payload.idade < 18 ||
    payload.idade > 70 ||
    typeof payload.distancia !== "number" ||
    payload.distancia < 0 ||
    payload.distancia > 100 ||
    !isSetor(payload.setor) ||
    !isTurno(payload.turno)
  ) {
    return "Payload invalido. Envie idade, distancia, setor e turno validos.";
  }

  return null;
}

export async function POST(request: Request) {
  let payload: Partial<PredictionInput>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisicao deve ser JSON." }, { status: 400 });
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  return NextResponse.json(predictAbsenteeism(payload as PredictionInput));
}
