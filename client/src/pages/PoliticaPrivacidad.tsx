import { useEffect } from "react";
import { useParams } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import LegalText, { Inline } from "@/components/legal-text";

type Item = { id: string; title: string; content: string };
type Doc = { title: string; updated: string; intro: string; items: Item[] };

const data: Record<string, Doc> = {
  "es": {
    "title": "Política de privacidad",
    "updated": "Última actualización: octubre de 2026",
    "intro": "En XpertAuth queremos que sepas exactamente qué pasa con tus datos. Aquí lo contamos sin rodeos.",
    "items": [
      {
        "id": "responsable",
        "title": "01 · Quién es el responsable",
        "content": "José Luis Echezarreta Fabregó, impulsor del proyecto XpertAuth.\nL'Escala (Girona).\nEmail: [info@xpertauth.com](mailto:info@xpertauth.com)\n\nXpertAuth es un proyecto personal, una asociación en proceso de estudio de constitución, sin actividad comercial: no cobra ni factura nada."
      },
      {
        "id": "datos",
        "title": "02 · Qué datos tratamos y para qué",
        "content": "**Si solo navegas**\n- Medimos las visitas con Plausible, una herramienta instalada en nuestro propio servidor. Es anónima: no usa cookies, no te identifica y no te sigue por otras webs. Solo sabemos qué páginas se visitan, desde dónde se llega y datos generales como el navegador o el país.\n- Nuestro proveedor de alojamiento (Vercel) registra datos técnicos de cada visita, como la dirección IP, por seguridad y para que la web funcione.\n\n**Si te registras con Google**\n- Recibimos tu nombre, tu email y tu foto de perfil de Google.\n- Los usamos para darte acceso a LEX y NOVA y para controlar el límite de consultas mensuales.\n\n**Si consultas a LEX o NOVA**\n- Para generar la respuesta, el texto de tu conversación (hasta los últimos 20 mensajes) se envía a Anthropic, la empresa que desarrolla Claude, el modelo de IA que responde.\n- En LEX, el texto de tus últimas preguntas se envía también a OpenAI, solo para buscar en nuestra base normativa.\n- **No guardamos el texto de tus preguntas ni de las respuestas.** Solo registramos quién consultó, cuándo, a qué agente y cuánto costó la consulta.\n- Te recomendamos no escribir datos personales (tuyos o de terceros) en las preguntas.\n\n**Si nos escribes por el formulario de contacto**\n- Recibimos tu nombre, tu email, tu mensaje y la fecha en que aceptaste esta política.\n- Los usamos solo para responderte. El mensaje nos llega por correo y guardamos una copia.\n\n**Si reservas una cita**\n- El calendario de citas es un servicio de Google. Los datos que introduzcas allí los trata Google según su propia política."
      },
      {
        "id": "base",
        "title": "03 · Por qué podemos tratarlos (base legal)",
        "content": "- **Tu consentimiento:** al registrarte o al enviarnos el formulario. Puedes retirarlo cuando quieras.\n- **Interés legítimo:** para la medición anónima de visitas y los registros técnicos de seguridad."
      },
      {
        "id": "conservacion",
        "title": "04 · Cuánto tiempo los guardamos",
        "content": "- **Cuenta registrada:** mientras quieras. Para darte de baja, escríbenos a [info@xpertauth.com](mailto:info@xpertauth.com) y la borramos.\n- **Registro de consultas** (sin el texto): 2 años.\n- **Mensajes de contacto:** 1 año desde que te respondemos."
      },
      {
        "id": "proveedores",
        "title": "05 · Quién más interviene",
        "content": "Para que la web funcione, nos apoyamos en estos proveedores:\n- **Hetzner** (servidor en Helsinki, Finlandia, UE): aloja nuestra base de datos, las cuentas, las imágenes y la medición de visitas.\n- **Vercel** (EE. UU.): aloja la web. Las funciones que procesan las consultas y el formulario se ejecutan en Fráncfort (Alemania, UE).\n- **Anthropic** (EE. UU.): genera las respuestas de LEX y NOVA.\n- **OpenAI** (EE. UU.; en Europa, a través de OpenAI Ireland): ayuda a LEX a buscar en la base normativa.\n- **Resend** (EE. UU.): envía los correos del formulario de contacto.\n- **Google** (EE. UU.): inicio de sesión y calendario de citas.\n\nAnthropic y OpenAI no usan el contenido de las consultas para entrenar sus modelos y lo conservan solo un tiempo limitado (en general, unos 30 días) antes de borrarlo.\n\nLas transferencias de datos a Estados Unidos se apoyan en los mecanismos previstos por la normativa europea: el Marco de Privacidad de Datos UE-EE. UU. (Resend y Google) o las cláusulas contractuales tipo de la Comisión Europea (Anthropic y OpenAI)."
      },
      {
        "id": "no-hacemos",
        "title": "06 · Lo que no hacemos",
        "content": "- No vendemos ni cedemos tus datos a nadie.\n- No usamos cookies ni publicidad.\n- No creamos perfiles sobre ti.\n- LEX y NOVA orientan; no toman decisiones por ti."
      },
      {
        "id": "edad",
        "title": "07 · Edad mínima",
        "content": "Para registrarte tienes que ser mayor de 18 años."
      },
      {
        "id": "derechos",
        "title": "08 · Tus derechos",
        "content": "Puedes pedir en cualquier momento acceder a tus datos, corregirlos, borrarlos, oponerte a su uso, limitarlo o llevártelos. Escríbenos a [info@xpertauth.com](mailto:info@xpertauth.com) y te responderemos en un plazo máximo de un mes.\n\nSi crees que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos ([aepd.es](https://www.aepd.es))."
      },
      {
        "id": "cambios",
        "title": "09 · Cambios en esta política",
        "content": "Si cambia algo importante, actualizaremos esta página y la fecha de arriba."
      }
    ]
  },
  "ca": {
    "title": "Política de privacitat",
    "updated": "Darrera actualització: octubre de 2026",
    "intro": "A XpertAuth volem que sàpigues exactament què passa amb les teves dades. Aquí t'ho expliquem sense embuts.",
    "items": [
      {
        "id": "responsable",
        "title": "01 · Qui és el responsable",
        "content": "José Luis Echezarreta Fabregó, impulsor del projecte XpertAuth.\nL'Escala (Girona).\nEmail: [info@xpertauth.com](mailto:info@xpertauth.com)\n\nXpertAuth és un projecte personal, una associació en procés d'estudi de constitució, sense activitat comercial: no cobra ni factura res."
      },
      {
        "id": "datos",
        "title": "02 · Quines dades tractem i per a què",
        "content": "**Si només navegues**\n- Mesurem les visites amb Plausible, una eina instal·lada al nostre propi servidor. És anònima: no fa servir galetes, no t'identifica i no et segueix per altres webs. Només sabem quines pàgines es visiten, des d'on s'hi arriba i dades generals com el navegador o el país.\n- El nostre proveïdor d'allotjament (Vercel) registra dades tècniques de cada visita, com l'adreça IP, per seguretat i perquè el web funcioni.\n\n**Si et registres amb Google**\n- Rebem el teu nom, el teu email i la teva foto de perfil de Google.\n- Els fem servir per donar-te accés a LEX i NOVA i per controlar el límit de consultes mensuals.\n\n**Si consultes LEX o NOVA**\n- Per generar la resposta, el text de la teva conversa (fins als últims 20 missatges) s'envia a Anthropic, l'empresa que desenvolupa Claude, el model d'IA que respon.\n- A LEX, el text de les teves últimes preguntes s'envia també a OpenAI, només per cercar a la nostra base normativa.\n- **No guardem el text de les teves preguntes ni de les respostes.** Només registrem qui ha consultat, quan, a quin agent i quant ha costat la consulta.\n- Et recomanem no escriure dades personals (teves o de tercers) a les preguntes.\n\n**Si ens escrius pel formulari de contacte**\n- Rebem el teu nom, el teu email, el teu missatge i la data en què vas acceptar aquesta política.\n- Només els fem servir per respondre't. El missatge ens arriba per correu i en guardem una còpia.\n\n**Si reserves una cita**\n- El calendari de cites és un servei de Google. Les dades que hi introdueixis les tracta Google segons la seva pròpia política."
      },
      {
        "id": "base",
        "title": "03 · Per què podem tractar-les (base legal)",
        "content": "- **El teu consentiment:** en registrar-te o en enviar-nos el formulari. Pots retirar-lo quan vulguis.\n- **Interès legítim:** per al mesurament anònim de visites i els registres tècnics de seguretat."
      },
      {
        "id": "conservacion",
        "title": "04 · Quant de temps les guardem",
        "content": "- **Compte registrat:** mentre vulguis. Per donar-te de baixa, escriu-nos a [info@xpertauth.com](mailto:info@xpertauth.com) i l'esborrem.\n- **Registre de consultes** (sense el text): 2 anys.\n- **Missatges de contacte:** 1 any des que et responem."
      },
      {
        "id": "proveedores",
        "title": "05 · Qui més hi intervé",
        "content": "Perquè el web funcioni, ens recolzem en aquests proveïdors:\n- **Hetzner** (servidor a Hèlsinki, Finlàndia, UE): allotja la nostra base de dades, els comptes, les imatges i el mesurament de visites.\n- **Vercel** (EUA): allotja el web. Les funcions que processen les consultes i el formulari s'executen a Frankfurt (Alemanya, UE).\n- **Anthropic** (EUA): genera les respostes de LEX i NOVA.\n- **OpenAI** (EUA; a Europa, a través d'OpenAI Ireland): ajuda LEX a cercar a la base normativa.\n- **Resend** (EUA): envia els correus del formulari de contacte.\n- **Google** (EUA): inici de sessió i calendari de cites.\n\nAnthropic i OpenAI no fan servir el contingut de les consultes per entrenar els seus models i el conserven només un temps limitat (en general, uns 30 dies) abans d'esborrar-lo.\n\nLes transferències de dades als Estats Units es recolzen en els mecanismes previstos per la normativa europea: el Marc de Privadesa de Dades UE-EUA (Resend i Google) o les clàusules contractuals tipus de la Comissió Europea (Anthropic i OpenAI)."
      },
      {
        "id": "no-hacemos",
        "title": "06 · El que no fem",
        "content": "- No venem ni cedim les teves dades a ningú.\n- No fem servir galetes ni publicitat.\n- No creem perfils sobre tu.\n- LEX i NOVA orienten; no prenen decisions per tu."
      },
      {
        "id": "edad",
        "title": "07 · Edat mínima",
        "content": "Per registrar-te has de ser major de 18 anys."
      },
      {
        "id": "derechos",
        "title": "08 · Els teus drets",
        "content": "Pots demanar en qualsevol moment accedir a les teves dades, corregir-les, esborrar-les, oposar-te al seu ús, limitar-lo o endur-te-les. Escriu-nos a [info@xpertauth.com](mailto:info@xpertauth.com) i et respondrem en un termini màxim d'un mes.\n\nSi creus que no hem tractat bé les teves dades, pots reclamar davant l'Agència Espanyola de Protecció de Dades ([aepd.es](https://www.aepd.es))."
      },
      {
        "id": "cambios",
        "title": "09 · Canvis en aquesta política",
        "content": "Si canvia alguna cosa important, actualitzarem aquesta pàgina i la data de dalt."
      }
    ]
  },
  "en": {
    "title": "Privacy policy",
    "updated": "Last updated: October 2026",
    "intro": "At XpertAuth we want you to know exactly what happens to your data. Here is the plain explanation.",
    "items": [
      {
        "id": "responsable",
        "title": "01 · Who is responsible",
        "content": "José Luis Echezarreta Fabregó, promoter of the XpertAuth project.\nL'Escala (Girona).\nEmail: [info@xpertauth.com](mailto:info@xpertauth.com)\n\nXpertAuth is a personal project, an association whose incorporation is being studied, with no commercial activity: it does not charge or invoice anything."
      },
      {
        "id": "datos",
        "title": "02 · What data we process and why",
        "content": "**If you only browse**\n- We measure visits with Plausible, a tool installed on our own server. It is anonymous: it does not use cookies, does not identify you and does not follow you across other websites. We only know which pages are visited, where visitors come from and general information such as the browser or the country.\n- Our hosting provider (Vercel) logs technical data about each visit, such as the IP address, for security and so that the website works.\n\n**If you sign up with Google**\n- We receive your name, your email and your profile picture from Google.\n- We use them to give you access to LEX and NOVA and to control the monthly query limit.\n\n**If you ask LEX or NOVA**\n- To generate the answer, the text of your conversation (up to the last 20 messages) is sent to Anthropic, the company that develops Claude, the AI model that answers.\n- In LEX, the text of your latest questions is also sent to OpenAI, only to search our regulatory database.\n- **We do not store the text of your questions or of the answers.** We only record who asked, when, which agent and how much the query cost.\n- We recommend that you do not write personal data (yours or anyone else's) in your questions.\n\n**If you write to us through the contact form**\n- We receive your name, your email, your message and the date on which you accepted this policy.\n- We use them only to reply to you. The message reaches us by email and we keep a copy.\n\n**If you book an appointment**\n- The appointment calendar is a Google service. Google processes the data you enter there under its own policy."
      },
      {
        "id": "base",
        "title": "03 · Why we can process it (legal basis)",
        "content": "- **Your consent:** when you sign up or send us the form. You can withdraw it at any time.\n- **Legitimate interest:** for anonymous visit measurement and technical security logs."
      },
      {
        "id": "conservacion",
        "title": "04 · How long we keep it",
        "content": "- **Registered account:** for as long as you want. To delete your account, write to us at [info@xpertauth.com](mailto:info@xpertauth.com) and we will delete it.\n- **Query log** (without the text): 2 years.\n- **Contact messages:** 1 year from the moment we reply to you."
      },
      {
        "id": "proveedores",
        "title": "05 · Who else is involved",
        "content": "To make the website work, we rely on these providers:\n- **Hetzner** (server in Helsinki, Finland, EU): hosts our database, accounts, images and visit measurement.\n- **Vercel** (USA): hosts the website. The functions that process queries and the form run in Frankfurt (Germany, EU).\n- **Anthropic** (USA): generates the answers of LEX and NOVA.\n- **OpenAI** (USA; in Europe, through OpenAI Ireland): helps LEX search the regulatory database.\n- **Resend** (USA): sends the contact form emails.\n- **Google** (USA): sign-in and appointment calendar.\n\nAnthropic and OpenAI do not use the content of queries to train their models and keep it only for a limited time (generally around 30 days) before deleting it.\n\nTransfers of data to the United States rely on the mechanisms provided by European regulation: the EU-US Data Privacy Framework (Resend and Google) or the European Commission's standard contractual clauses (Anthropic and OpenAI)."
      },
      {
        "id": "no-hacemos",
        "title": "06 · What we do not do",
        "content": "- We do not sell or hand over your data to anyone.\n- We do not use cookies or advertising.\n- We do not build profiles about you.\n- LEX and NOVA give guidance; they do not make decisions for you."
      },
      {
        "id": "edad",
        "title": "07 · Minimum age",
        "content": "To sign up you must be 18 or older."
      },
      {
        "id": "derechos",
        "title": "08 · Your rights",
        "content": "You can ask at any time to access your data, correct it, delete it, object to its use, restrict it or take it with you. Write to us at [info@xpertauth.com](mailto:info@xpertauth.com) and we will reply within a maximum of one month.\n\nIf you think we have not handled your data properly, you can lodge a complaint with the Spanish Data Protection Agency ([aepd.es](https://www.aepd.es))."
      },
      {
        "id": "cambios",
        "title": "09 · Changes to this policy",
        "content": "If something important changes, we will update this page and the date above."
      }
    ]
  },
  "fr": {
    "title": "Politique de confidentialité",
    "updated": "Dernière mise à jour : octobre 2026",
    "intro": "Chez XpertAuth, nous voulons que vous sachiez exactement ce qu'il advient de vos données. Nous vous l'expliquons ici sans détour.",
    "items": [
      {
        "id": "responsable",
        "title": "01 · Qui est responsable",
        "content": "José Luis Echezarreta Fabregó, promoteur du projet XpertAuth.\nL'Escala (Gérone).\nEmail : [info@xpertauth.com](mailto:info@xpertauth.com)\n\nXpertAuth est un projet personnel, une association dont la constitution est à l'étude, sans activité commerciale : elle ne facture ni n'encaisse rien."
      },
      {
        "id": "datos",
        "title": "02 · Quelles données nous traitons et pourquoi",
        "content": "**Si vous naviguez seulement**\n- Nous mesurons les visites avec Plausible, un outil installé sur notre propre serveur. Il est anonyme : il n'utilise pas de cookies, ne vous identifie pas et ne vous suit pas sur d'autres sites. Nous savons seulement quelles pages sont visitées, d'où viennent les visiteurs et des données générales comme le navigateur ou le pays.\n- Notre hébergeur (Vercel) enregistre des données techniques de chaque visite, comme l'adresse IP, pour des raisons de sécurité et pour que le site fonctionne.\n\n**Si vous vous inscrivez avec Google**\n- Nous recevons votre nom, votre email et votre photo de profil de Google.\n- Nous les utilisons pour vous donner accès à LEX et NOVA et pour contrôler la limite mensuelle de consultations.\n\n**Si vous consultez LEX ou NOVA**\n- Pour générer la réponse, le texte de votre conversation (jusqu'aux 20 derniers messages) est envoyé à Anthropic, l'entreprise qui développe Claude, le modèle d'IA qui répond.\n- Dans LEX, le texte de vos dernières questions est aussi envoyé à OpenAI, uniquement pour effectuer une recherche dans notre base réglementaire.\n- **Nous ne conservons pas le texte de vos questions ni des réponses.** Nous enregistrons seulement qui a consulté, quand, quel agent et combien la consultation a coûté.\n- Nous vous recommandons de ne pas écrire de données personnelles (les vôtres ou celles de tiers) dans vos questions.\n\n**Si vous nous écrivez via le formulaire de contact**\n- Nous recevons votre nom, votre email, votre message et la date à laquelle vous avez accepté cette politique.\n- Nous les utilisons uniquement pour vous répondre. Le message nous parvient par e-mail et nous en gardons une copie.\n\n**Si vous réservez un rendez-vous**\n- Le calendrier de rendez-vous est un service de Google. Les données que vous y saisissez sont traitées par Google selon sa propre politique."
      },
      {
        "id": "base",
        "title": "03 · Pourquoi nous pouvons les traiter (base légale)",
        "content": "- **Votre consentement :** lors de votre inscription ou de l'envoi du formulaire. Vous pouvez le retirer à tout moment.\n- **Intérêt légitime :** pour la mesure anonyme des visites et les journaux techniques de sécurité."
      },
      {
        "id": "conservacion",
        "title": "04 · Combien de temps nous les conservons",
        "content": "- **Compte inscrit :** tant que vous le souhaitez. Pour vous désinscrire, écrivez-nous à [info@xpertauth.com](mailto:info@xpertauth.com) et nous le supprimons.\n- **Journal des consultations** (sans le texte) : 2 ans.\n- **Messages de contact :** 1 an à compter de notre réponse."
      },
      {
        "id": "proveedores",
        "title": "05 · Qui d'autre intervient",
        "content": "Pour que le site fonctionne, nous nous appuyons sur ces prestataires :\n- **Hetzner** (serveur à Helsinki, Finlande, UE) : héberge notre base de données, les comptes, les images et la mesure des visites.\n- **Vercel** (États-Unis) : héberge le site. Les fonctions qui traitent les consultations et le formulaire s'exécutent à Francfort (Allemagne, UE).\n- **Anthropic** (États-Unis) : génère les réponses de LEX et NOVA.\n- **OpenAI** (États-Unis ; en Europe, via OpenAI Ireland) : aide LEX à effectuer des recherches dans la base réglementaire.\n- **Resend** (États-Unis) : envoie les e-mails du formulaire de contact.\n- **Google** (États-Unis) : connexion et calendrier de rendez-vous.\n\nAnthropic et OpenAI n'utilisent pas le contenu des consultations pour entraîner leurs modèles et ne le conservent que pendant une durée limitée (en général, environ 30 jours) avant de le supprimer.\n\nLes transferts de données vers les États-Unis reposent sur les mécanismes prévus par la réglementation européenne : le Cadre de protection des données UE-États-Unis (Resend et Google) ou les clauses contractuelles types de la Commission européenne (Anthropic et OpenAI)."
      },
      {
        "id": "no-hacemos",
        "title": "06 · Ce que nous ne faisons pas",
        "content": "- Nous ne vendons ni ne cédons vos données à personne.\n- Nous n'utilisons ni cookies ni publicité.\n- Nous ne créons pas de profils sur vous.\n- LEX et NOVA orientent ; ils ne prennent pas de décisions à votre place."
      },
      {
        "id": "edad",
        "title": "07 · Âge minimum",
        "content": "Pour vous inscrire, vous devez avoir au moins 18 ans."
      },
      {
        "id": "derechos",
        "title": "08 · Vos droits",
        "content": "Vous pouvez demander à tout moment d'accéder à vos données, de les corriger, de les supprimer, de vous opposer à leur utilisation, de la limiter ou de les récupérer. Écrivez-nous à [info@xpertauth.com](mailto:info@xpertauth.com) et nous vous répondrons dans un délai maximum d'un mois.\n\nSi vous estimez que nous n'avons pas bien traité vos données, vous pouvez déposer une réclamation auprès de l'Agence espagnole de protection des données ([aepd.es](https://www.aepd.es))."
      },
      {
        "id": "cambios",
        "title": "09 · Modifications de cette politique",
        "content": "Si quelque chose d'important change, nous mettrons à jour cette page et la date ci-dessus."
      }
    ]
  }
};

export default function PoliticaPrivacidad() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale && data[params.locale] ? params.locale : "es";
  const s = data[locale];

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <style>{`
        .legal-card { transition: border-color 0.2s ease; }
        .legal-card:hover { border-color: rgba(77,159,236,0.3); }
      `}</style>
      <Navbar />
      <section className="pt-32 pb-12 px-6 bg-[#0A0E1A]">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#4D9FEC] uppercase mb-4 border border-[#4D9FEC]/30 px-3 py-1 rounded-full">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{s.title}</h1>
          <p className="text-white/40 text-sm">{s.updated}</p>
          {s.intro && <p className="text-white/60 text-lg mt-6 leading-relaxed">{s.intro}</p>}
        </div>
      </section>
      <section className="px-6 pb-8 bg-[#0A0E1A]">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
          {s.items.map(item => (
            <a key={item.id} href={"#" + item.id} className="text-xs text-white/40 hover:text-[#4D9FEC] border border-white/10 hover:border-[#4D9FEC]/30 px-3 py-1.5 rounded-full transition-all">
              {item.title.split(" · ")[1]}
            </a>
          ))}
        </div>
      </section>
      <section className="px-6 pb-20 bg-[#0A0E1A]">
        <div className="max-w-3xl mx-auto space-y-4">
          {s.items.map(item => (
            <div key={item.id} id={item.id} className="legal-card bg-[#0F1628] border border-white/8 rounded-xl p-7 scroll-mt-24">
              <h2 className="text-xs font-bold text-[#4D9FEC] mb-4 tracking-wide uppercase">{item.title}</h2>
              <LegalText text={item.content} />
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
