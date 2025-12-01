import Head from 'next/head';
import Link from 'next/link';

export default function AvisoDePrivacidad() {
  return (
    <div className="min-h-screen bg-[#F3F1EC] text-[#1C2533]">
      <Head>
        <title>Aviso de privacidad · Gran Dzilam</title>
        <meta name="description" content="Conoce cómo protegemos tus datos en Gran Dzilam." />
      </Head>

      <header className="bg-[#0F172A] px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Documentación</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Aviso de privacidad</h1>
          <p className="mt-4 max-w-3xl text-sm text-white/80">
            Tu confianza es lo más importante. Aquí te explicamos de forma clara cómo recabamos, usamos y protegemos la
            información que nos compartes.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] transition hover:scale-[1.02]"
          >
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-6 py-12">
        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">1. Datos que recopilamos</h2>
          <p className="text-sm leading-relaxed text-[#475569]">
            Podemos solicitar datos de contacto (nombre, correo, teléfono) y preferencias relacionadas con tu proyecto dentro de
            Gran Dzilam. Esta información se utiliza para brindarte una atención personalizada y mejorar tu experiencia en el
            cotizador.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">2. Uso de la información</h2>
          <p className="text-sm leading-relaxed text-[#475569]">
            Los datos se emplean para responder tus solicitudes, mostrar cotizaciones acordes a tus intereses, mejorar nuestras
            herramientas y compartir información relevante sobre el desarrollo. No vendemos ni cedemos tus datos personales a
            terceros ajenos al proyecto.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">3. Cookies y tecnologías similares</h2>
          <p className="text-sm leading-relaxed text-[#475569]">
            Utilizamos cookies necesarias para el funcionamiento del sitio y opcionales para analizar el uso del cotizador. Tú
            decides si aceptas todas o solo las esenciales. Puedes actualizar tu elección en cualquier momento desde las
            preferencias de cookies.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">4. Derechos de los titulares</h2>
          <p className="text-sm leading-relaxed text-[#475569]">
            Puedes acceder, rectificar o solicitar la eliminación de tus datos personales, así como limitar su uso. Para
            ejercer estos derechos escríbenos y atenderemos tu solicitud con prontitud.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">5. Contacto</h2>
          <p className="text-sm leading-relaxed text-[#475569]">
            Si tienes dudas sobre este aviso o sobre el manejo de tus datos, contáctanos en cualquier momento. Estamos para
            ayudarte y mantener tu información segura.
          </p>
        </section>
      </main>
    </div>
  );
}
