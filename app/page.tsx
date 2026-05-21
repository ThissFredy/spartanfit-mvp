import Image from "next/image";
import { Dumbbell, Sparkles, TrendingUp, ShieldCheck, MessageSquare, ArrowRight } from "lucide-react";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = {
  title: "SpartanFit | Coaching de fitness con IA",
  description:
    "SpartanFit combina seguimiento de entrenamientos, progreso visual y coaching con IA para hipertrofia y fuerza.",
};

const benefits = [
  {
    title: "Plan inteligente",
    description: "Recomendaciones adaptadas a tu objetivo, nivel y constancia semanal.",
    icon: <Sparkles className="h-5 w-5 text-spartan-light" />,
  },
  {
    title: "Seguimiento real",
    description: "Visualiza progresión de carga por ejercicio con gráficos claros.",
    icon: <TrendingUp className="h-5 w-5 text-spartan-light" />,
  },
  {
    title: "Rutinas efectivas",
    description: "Estructura sesiones por bloques para fuerza, hipertrofia y control de volumen.",
    icon: <Dumbbell className="h-5 w-5 text-spartan-light" />,
  },
  {
    title: "Privacidad y control",
    description: "Tus datos y avances bajo una experiencia segura y enfocada en rendimiento.",
    icon: <ShieldCheck className="h-5 w-5 text-spartan-light" />,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <PublicHeader />
      <main>
        <section id="inicio" className="relative overflow-hidden border-b border-zinc-800">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-spartan/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-red-900/20 blur-3xl" />
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-spartan/30 bg-spartan/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-spartan-light">
                <Sparkles className="h-3.5 w-3.5" />
                Plataforma de coaching con IA
              </p>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                Entrena con precisión.
                <span className="block text-spartan-light">Progresa con disciplina.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-zinc-300 sm:text-lg">
                SpartanFit te ayuda a registrar entrenamientos, visualizar progreso y tomar mejores decisiones con soporte de IA en tiempo real.
              </p>
              <div id="acceso" className="mt-8 flex flex-col items-start gap-3">
                <GoogleLoginButton />
                <p className="text-xs text-zinc-500">Al iniciar sesión aceptas términos y políticas básicas de uso.</p>
              </div>
            </div>

            <Card className="border-zinc-700/80 bg-zinc-900/70">
              <CardHeader>
                <CardTitle className="text-xl">Preview del Coach IA</CardTitle>
                <CardDescription>Conversación enfocada en acciones concretas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="max-w-[90%] rounded-2xl rounded-br-md bg-spartan px-4 py-3 text-white">
                  ¿Cómo mejoro mi hipertrofia si solo entreno 4 días?
                </div>
                <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-200">
                  Distribuye 12-16 series semanales por grupo muscular y usa progresión de carga 2-5% cuando completes repeticiones objetivo.
                </div>
                <div className="max-w-[90%] rounded-2xl rounded-br-md bg-spartan px-4 py-3 text-white">
                  ¿Qué hago hoy para espalda y bíceps?
                </div>
                <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-200">
                  Empieza con dominadas asistidas, remo con barra y jalones; luego bíceps con curl inclinado y martillo.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="beneficios" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-semibold">Beneficios clave</h2>
          <p className="mt-2 text-zinc-400">Todo en una interfaz limpia, responsive y pensada para ejecución diaria.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="transition-transform duration-200 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {benefit.icon}
                    {benefit.title}
                  </CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section id="funcionamiento" className="border-y border-zinc-800 bg-zinc-900/40">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
            {["Completa tu perfil", "Registra tus entrenamientos", "Ajusta con IA"].map((title, index) => (
              <Card key={title} className="bg-zinc-950/70">
                <CardHeader>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-spartan-light">Paso {index + 1}</p>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400">
                    {index === 0 && "Define objetivo, contexto físico y sedes para personalizar el plan."}
                    {index === 1 && "Carga cada sesión con sets, reps y peso para medir evolución real."}
                    {index === 2 && "Consulta al coach IA para decidir progresión, volumen y enfoque semanal."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="coach" className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold">Coach IA SpartanFit</h2>
            <p className="mt-3 text-zinc-400">
              Resuelve dudas de hipertrofia, fuerza, técnica y organización de rutinas sin salir de la plataforma.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-zinc-300">
              <li className="flex items-start gap-2"><ArrowRight className="mt-0.5 h-4 w-4 text-spartan-light" /> Respuestas accionables en lenguaje claro.</li>
              <li className="flex items-start gap-2"><ArrowRight className="mt-0.5 h-4 w-4 text-spartan-light" /> Sugerencias alineadas a tus registros.</li>
              <li className="flex items-start gap-2"><ArrowRight className="mt-0.5 h-4 w-4 text-spartan-light" /> Conversación continua con historial.</li>
            </ul>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-spartan-light" />Ejemplos de consultas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-300">
              <p>• ¿Cómo distribuyo empuje/tirón/pierna en 5 días?</p>
              <p>• ¿Qué hago si me estanqué en press banca?</p>
              <p>• Analiza mi última semana y sugiere ajustes.</p>
              <p>• ¿Qué volumen semanal necesito para cuádriceps?</p>
            </CardContent>
          </Card>
        </section>

        <section id="progreso" className="border-y border-zinc-800 bg-zinc-900/35">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-3xl font-semibold">Progreso visual</h2>
            <p className="mt-2 text-zinc-400">Monitorea tendencia de cargas y toma decisiones con evidencia de tus sesiones.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Card><CardHeader><CardTitle className="text-lg">Curva de fuerza</CardTitle></CardHeader><CardContent><p className="text-sm text-zinc-400">Evolución por ejercicio y fecha.</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-lg">Máximos personales</CardTitle></CardHeader><CardContent><p className="text-sm text-zinc-400">Identifica picos de rendimiento por bloque.</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-lg">Consistencia semanal</CardTitle></CardHeader><CardContent><p className="text-sm text-zinc-400">Visualiza si sostienes frecuencia y volumen.</p></CardContent></Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-6 py-10">
            <Image src="/icon.png" alt="Logo SpartanFit" width={70} height={70} className="mx-auto rounded-2xl" />
            <h2 className="mt-5 text-3xl font-semibold">Empieza hoy con SpartanFit</h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-400">
              Convierte cada entrenamiento en datos accionables y construye resultados sostenibles.
            </p>
            <div className="mt-6 flex justify-center">
              <GoogleLoginButton />
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

