import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Hammer,
  HelpCircle,
  MessageCircle,
  Paintbrush,
  Scissors,
  Search,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import { ProviderFaqAccordion } from "@/components/landing/provider-faq-accordion";
import { Button } from "@/components/ui/button";

const ctaBackground =
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=400&fit=crop&crop=center&q=60";

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description:
      "Entre com seus dados e defina seu perfil como prestador em um fluxo direto.",
  },
  {
    number: "02",
    title: "Complete seu perfil",
    description:
      "Adicione WhatsApp, CEP, categorias e uma descrição clara do que você faz.",
  },
  {
    number: "03",
    title: "Comece a receber contatos",
    description:
      "Seu perfil fica pronto para aparecer nas buscas e gerar novas oportunidades.",
  },
];

const proofItems = [
  {
    icon: Sparkles,
    title: "Cadastro grátis",
    description: "Entre rápido, sem custo para começar.",
  },
  {
    icon: MessageCircle,
    title: "Contato direto",
    description: "Receba mensagens no seu WhatsApp.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Perfil profissional",
    description: "Categorias, descrição e portfólio no mesmo lugar.",
  },
  {
    icon: Clock3,
    title: "Edite quando quiser",
    description: "Atualize seu perfil conforme seu negócio cresce.",
  },
];

const categories = [
  "Eletricista",
  "Encanador",
  "Diarista",
  "Pintor",
  "Jardineiro",
  "Cabeleireira",
  "Mecânico",
  "Técnico de informática",
];

const faqs = [
  {
    question: "Preciso pagar para criar meu perfil?",
    answer:
      "Não. O objetivo desta página é levar o prestador para um cadastro simples e rápido, sem custo para começar.",
  },
  {
    question: "Quanto tempo leva para entrar?",
    answer:
      "Se você já tiver seus dados em mãos, o cadastro leva poucos minutos. Depois, você pode completar e melhorar o perfil quando quiser.",
  },
  {
    question: "Como o cliente fala comigo?",
    answer:
      "O contato acontece direto no seu WhatsApp. Isso reduz fricção e aumenta a chance de fechar serviços mais rápido.",
  },
];

function SectionDivider() {
  return (
    <div className="relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/60" />
        <Sparkles className="h-5 w-5 text-primary/30" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/60" />
      </div>
    </div>
  );
}

export function ProviderLandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_42%),radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_36%)]" />

      <header className="fixed top-0 left-0 right-0 z-30 glass border-b border-border/50 shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="eufaço!"
              width={132}
              height={48}
              className="h-10 sm:h-14 w-auto"
            />
            <span className="hidden rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:inline-flex">
              Para prestadores
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="hidden text-slate-600 sm:inline-flex"
              >
                Sou cliente
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-600">
                Entrar
              </Button>
            </Link>
            <Link href="/register?role=provider&source=providers">
              <Button
                size="sm"
                className="gradient-bg rounded-xl border-0 px-4 text-white shadow-[0_12px_30px_rgba(14,165,233,0.28)] hover:brightness-105"
              >
                Criar perfil
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-36 lg:px-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-32 left-[10%] animate-float opacity-[0.08]">
              <Zap className="h-16 w-16 text-primary" />
            </div>
            <div
              className="absolute top-48 right-[12%] animate-float-slow opacity-[0.08]"
              style={{ animationDelay: "1s" }}
            >
              <Paintbrush className="h-14 w-14 text-primary" />
            </div>
            <div
              className="absolute bottom-24 left-[20%] animate-float-reverse opacity-[0.06]"
              style={{ animationDelay: "2s" }}
            >
              <Wrench className="h-12 w-12 text-primary" />
            </div>
            <div
              className="absolute top-64 left-[75%] animate-float opacity-[0.06]"
              style={{ animationDelay: "3s" }}
            >
              <Scissors className="h-12 w-12 text-primary" />
            </div>
            <div
              className="absolute right-[25%] bottom-40 animate-float-slow opacity-[0.07]"
              style={{ animationDelay: "0.5s" }}
            >
              <Hammer className="h-14 w-14 text-primary" />
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-4 py-2 text-sm font-medium text-primary shadow-sm">
                <Sparkles className="h-4 w-4" />
                Feito para quem quer captar clientes locais
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Receba novos clientes na sua região sem depender só de rede
                social
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Crie seu perfil, apareça nas buscas do app e receba contatos
                direto no WhatsApp. Você ganha um canal extra para atrair
                clientes e fechar serviços mais rápido.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/register?role=provider&source=providers">
                  <Button
                    size="lg"
                    className="gradient-bg h-[52px] w-full rounded-2xl border-0 px-8 text-base font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.3)] hover:brightness-105 sm:w-auto"
                  >
                    Criar perfil grátis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#como-funciona">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-[52px] w-full rounded-2xl border-primary/20 bg-white px-8 text-base text-primary hover:bg-primary/5 sm:w-auto"
                  >
                    Ver como funciona
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {proofItems.map((item) => (
                  <div
                    key={item.title}
                    className="glass flex items-center gap-3 rounded-2xl border border-border/50 px-4 py-3 shadow-sm"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm font-medium text-slate-700">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="relative w-[280px] h-[560px] rounded-[3rem] border-[8px] border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
                <div className="h-full bg-background rounded-[2.2rem] overflow-hidden p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg gradient-bg" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                  <div className="glass rounded-xl p-3 mb-3 flex items-center gap-2 border border-border/50">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <div className="h-2.5 w-24 bg-muted rounded" />
                  </div>
                  {[
                    "photo-1621905251189-08b45d6a269e",
                    "photo-1585704032915-c3400ca199e7",
                    "photo-1562259949-e8e7689d7828",
                  ].map((id, index) => (
                    <div
                      key={index}
                      className="mb-2.5 flex items-center gap-3 rounded-xl border border-border/50 glass p-2.5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://images.unsplash.com/${id}?w=96&h=96&fit=crop&crop=center&q=60`}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <div className="mb-1.5 h-2.5 w-20 rounded bg-muted-foreground/20" />
                        <div className="h-2 w-14 rounded bg-muted" />
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            className="h-2.5 w-2.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 space-y-2">
                    <div className="h-2 w-full rounded bg-muted" />
                    <div className="h-2 w-3/4 rounded bg-muted" />
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -left-16 hidden rounded-xl border border-border/50 glass p-3 shadow-lg lg:block">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="whitespace-nowrap text-xs font-semibold">
                    Profissional verificado
                  </span>
                </div>
              </div>

              <div className="absolute -right-16 bottom-20 hidden rounded-xl border border-border/50 glass p-3 shadow-lg lg:block">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="whitespace-nowrap text-xs font-semibold">
                    4.9 avaliações
                  </span>
                </div>
              </div>

              <div className="absolute top-1/2 -right-24 hidden rounded-xl border border-border/50 glass p-3 shadow-lg lg:block">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <span className="whitespace-nowrap text-xs font-semibold">
                    Chat via WhatsApp
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Direto ao ponto
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Tudo que você precisa para começar
                </h2>
              </div>
              <Link href="/register?role=provider&source=providers">
                <Button
                  variant="outline"
                  className="rounded-xl border-primary/20 bg-white text-primary hover:bg-primary/5"
                >
                  Criar perfil grátis
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {proofItems.map((item) => (
                <div
                  key={item.title}
                  className="glass rounded-2xl border border-border/50 p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        <section
          id="como-funciona"
          className="bg-gradient-to-b from-primary/[0.03] to-transparent px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Como funciona
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Crie seu perfil em 3 passos simples
                </h2>
              </div>
              <Link href="/register?role=provider&source=providers">
                <Button
                  variant="outline"
                    className="rounded-xl border-primary/20 bg-white text-primary hover:bg-primary/5"
                  >
                    Abrir cadastro
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map((item) => (
                <div
                  key={item.number}
                  className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-white p-6 shadow-sm"
                >
                  <div className="absolute right-5 top-5 text-6xl font-black leading-none text-primary/10">
                    {item.number}
                  </div>
                  <div className="relative">
                    <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Passo {item.number}
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        <section id="categorias" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="rounded-2xl border border-border/50 glass p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Ideal para
                </p>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                  Prestadores de serviços que precisam de mais demanda local
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-600">
                  A proposta funciona melhor para quem já atende por WhatsApp e
                  quer um canal extra de entrada de clientes sem depender apenas
                  de posts, stories ou indicação.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    "Apareça para clientes que já estão buscando esse serviço.",
                    "Receba contatos diretos sem depender só de rede social.",
                    "Tenha um perfil simples de atualizar e fácil de entender.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p className="text-sm leading-7 text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 glass p-8">
                <div className="flex flex-wrap gap-3">
                  {categories.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-slate-900">
                        Perfil mais confiável
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Avaliações e portfólio ajudam você a competir melhor.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-slate-900">
                        Conversa mais rápida
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      O cliente fala com você onde a conversa já fecha serviço.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Perguntas <span className="gradient-text">frequentes</span>
              </h2>
            </div>

            <ProviderFaqAccordion items={faqs} />
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-3xl">
              <Image
                src={ctaBackground}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95" />

              <div className="relative p-10 text-center text-white sm:p-16">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute right-1/4 bottom-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="relative">
                  <h2 className="text-3xl font-bold sm:text-4xl">
                    Pronto para começar?
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
                    Crie seu perfil, apareça nas buscas e receba contatos de clientes
                    na sua região.
                  </p>

                  <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href="/register?role=provider&source=providers">
                      <Button
                        size="lg"
                        className="gradient-bg h-12 rounded-xl border-0 px-8 text-base text-white shadow-lg hover:shadow-xl"
                      >
                        <BriefcaseBusiness className="h-4 w-4" />
                        Criar perfil grátis
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        size="lg"
                        className="h-12 rounded-xl border border-white/20 bg-white/10 px-8 text-base text-white hover:bg-white/20"
                      >
                        Já tenho conta
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <div className="mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.svg"
                  alt="eufaço!"
                  width={120}
                  height={44}
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                A plataforma que conecta você aos melhores prestadores de serviços da
                sua região.
              </p>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#como-funciona"
                    className="hover:text-foreground transition-colors"
                  >
                    Como funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="#categorias"
                    className="hover:text-foreground transition-colors"
                  >
                    Categorias
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?role=provider&source=providers"
                    className="hover:text-foreground transition-colors"
                  >
                    Criar conta
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    Termos de uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Política de privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} eufaço! Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
