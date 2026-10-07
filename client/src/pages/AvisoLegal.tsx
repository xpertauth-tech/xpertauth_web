import { useEffect } from "react";
import { useParams } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import LegalText, { Inline } from "@/components/legal-text";

type Item = { id: string; title: string; content: string };
type Doc = { title: string; updated: string; intro: string; items: Item[] };

const data: Record<string, Doc> = {
  "es": {
    "title": "Aviso legal",
    "updated": "Última actualización: octubre de 2026",
    "intro": "Aquí explicamos quién está detrás de esta web, qué ofrece y en qué condiciones puedes usarla.",
    "items": [
      {
        "id": "titular",
        "title": "01 · Quién está detrás",
        "content": "José Luis Echezarreta Fabregó, impulsor del proyecto XpertAuth.\nL'Escala (Girona).\nEmail: [info@xpertauth.com](mailto:info@xpertauth.com)\n\nXpertAuth es un proyecto personal, una asociación en proceso de estudio de constitución. No tiene actividad comercial: no cobra ni factura nada, y no firma contratos ni compromisos en nombre de ninguna entidad."
      },
      {
        "id": "oferta",
        "title": "02 · Qué ofrece esta web",
        "content": "- **LEX:** orientación sobre la normativa del transporte especial por carretera, basada en una base normativa propia.\n- **NOVA:** ideas prácticas para usar la inteligencia artificial en una pyme de transporte.\n- **Blog:** artículos sobre normativa y sobre la realidad del sector.\n- **Contacto y citas:** para plantear un caso concreto.\n\n**Lo que XpertAuth no hace:**\n- No tramita nada ante la administración (DGT, SCT ni ningún otro organismo). Orienta; el trámite lo haces tú o tu gestor.\n- No redacta ni firma informes, recursos o pliegos de descargo con responsabilidad legal. Esos documentos los prepara y firma un profesional habilitado."
      },
      {
        "id": "lex-nova",
        "title": "03 · Sobre LEX y NOVA",
        "content": "- Son asistentes de inteligencia artificial. Sus respuestas se generan automáticamente, sin que una persona las revise antes de mostrártelas, y **pueden contener errores**.\n- Tienen carácter orientativo. Antes de tomar una decisión con consecuencias legales o económicas, contrasta la información con la fuente oficial o con un profesional.\n- Para usarlos tienes que registrarte con Google y ser mayor de 18 años. Cada cuenta tiene un número limitado de consultas al mes.\n- Te pedimos un uso razonable: no intentes saltarte los límites ni usar los asistentes para fines ajenos al transporte."
      },
      {
        "id": "propiedad",
        "title": "04 · Propiedad intelectual",
        "content": "- Los textos, imágenes, logotipos y diseño de esta web pertenecen a XpertAuth o se usan con permiso. No los reproduzcas sin autorización, salvo para uso personal y no comercial.\n- Las normas oficiales que se citan (BOE, DOGC y otros diarios oficiales) son de dominio público.\n- Parte de las imágenes y de los textos se han creado con ayuda de inteligencia artificial y los ha revisado una persona, como se indica al pie de cada página."
      },
      {
        "id": "responsabilidad",
        "title": "05 · Responsabilidad",
        "content": "Ponemos el máximo cuidado en que la información sea correcta, pero la normativa cambia y puede haber errores u omisiones. Por eso no podemos garantizar que todo esté completo y actualizado en cada momento. Si detectas un error, escríbenos: lo agradecemos y lo corregimos."
      },
      {
        "id": "enlaces",
        "title": "06 · Enlaces a otras webs",
        "content": "Esta web enlaza a sitios de terceros: organismos oficiales (DGT, SCT, Generalitat, BOE, DOGC), el calendario de citas de Google y redes sociales (LinkedIn, Instagram y WhatsApp). No controlamos esos sitios ni respondemos de su contenido. Enlazar a ellos no implica ninguna relación comercial."
      },
      {
        "id": "legislacion",
        "title": "07 · Legislación aplicable",
        "content": "Esta web se rige por la legislación española, en particular la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE), el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos (LOPDGDD). Para cualquier conflicto, serán competentes los juzgados y tribunales que correspondan según la ley."
      },
      {
        "id": "cambios",
        "title": "08 · Cambios",
        "content": "Si cambia algo importante, actualizaremos esta página y la fecha de arriba."
      }
    ]
  },
  "ca": {
    "title": "Avís legal",
    "updated": "Darrera actualització: octubre de 2026",
    "intro": "Aquí expliquem qui hi ha darrere d'aquest web, què ofereix i en quines condicions pots utilitzar-lo.",
    "items": [
      {
        "id": "titular",
        "title": "01 · Qui hi ha al darrere",
        "content": "José Luis Echezarreta Fabregó, impulsor del projecte XpertAuth.\nL'Escala (Girona).\nCorreu electrònic: [info@xpertauth.com](mailto:info@xpertauth.com)\n\nXpertAuth és un projecte personal, una associació en procés d'estudi de constitució. No té activitat comercial: no cobra ni factura res, i no signa contractes ni compromisos en nom de cap entitat."
      },
      {
        "id": "oferta",
        "title": "02 · Què ofereix aquest web",
        "content": "- **LEX:** orientació sobre la normativa del transport especial per carretera, basada en una base normativa pròpia.\n- **NOVA:** idees pràctiques per fer servir la intel·ligència artificial en una pime de transport.\n- **Blog:** articles sobre normativa i sobre la realitat del sector.\n- **Contacte i cites:** per plantejar un cas concret.\n\n**El que XpertAuth no fa:**\n- No tramita res davant l'administració (DGT, SCT ni cap altre organisme). Orienta; el tràmit el fas tu o el teu gestor.\n- No redacta ni signa informes, recursos o plecs de descàrrecs amb responsabilitat legal. Aquests documents els prepara i els signa un professional habilitat."
      },
      {
        "id": "lex-nova",
        "title": "03 · Sobre LEX i NOVA",
        "content": "- Són assistents d'intel·ligència artificial. Les seves respostes es generen automàticament, sense que cap persona les revisi abans de mostrar-te-les, i **poden contenir errors**.\n- Tenen caràcter orientatiu. Abans de prendre una decisió amb conseqüències legals o econòmiques, contrasta la informació amb la font oficial o amb un professional.\n- Per fer-los servir t'has de registrar amb Google i ser major de 18 anys. Cada compte té un nombre limitat de consultes al mes.\n- Et demanem un ús raonable: no intentis saltar-te els límits ni fer servir els assistents per a fins aliens al transport."
      },
      {
        "id": "propiedad",
        "title": "04 · Propietat intel·lectual",
        "content": "- Els textos, imatges, logotips i disseny d'aquest web pertanyen a XpertAuth o s'utilitzen amb permís. No els reprodueixis sense autorització, tret d'ús personal i no comercial.\n- Les normes oficials que es citen (BOE, DOGC i altres diaris oficials) són de domini públic.\n- Part de les imatges i dels textos s'han creat amb ajuda d'intel·ligència artificial i els ha revisat una persona, tal com s'indica al peu de cada pàgina."
      },
      {
        "id": "responsabilidad",
        "title": "05 · Responsabilitat",
        "content": "Posem el màxim de cura perquè la informació sigui correcta, però la normativa canvia i pot haver-hi errors o omissions. Per això no podem garantir que tot estigui complet i actualitzat en cada moment. Si detectes un error, escriu-nos: ho agraïm i el corregim."
      },
      {
        "id": "enlaces",
        "title": "06 · Enllaços a altres webs",
        "content": "Aquest web enllaça a llocs de tercers: organismes oficials (DGT, SCT, Generalitat, BOE, DOGC), el calendari de cites de Google i xarxes socials (LinkedIn, Instagram i WhatsApp). No controlem aquests llocs ni responem del seu contingut. Enllaçar-hi no implica cap relació comercial."
      },
      {
        "id": "legislacion",
        "title": "07 · Legislació aplicable",
        "content": "Aquest web es regeix per la legislació espanyola, en particular la Llei 34/2002 de Serveis de la Societat de la Informació (LSSI-CE), el Reglament General de Protecció de Dades (RGPD) i la Llei Orgànica 3/2018 de Protecció de Dades (LOPDGDD). Per a qualsevol conflicte, seran competents els jutjats i tribunals que corresponguin segons la llei."
      },
      {
        "id": "cambios",
        "title": "08 · Canvis",
        "content": "Si canvia alguna cosa important, actualitzarem aquesta pàgina i la data de dalt."
      }
    ]
  },
  "en": {
    "title": "Legal notice",
    "updated": "Last updated: October 2026",
    "intro": "Here we explain who is behind this website, what it offers and under what conditions you can use it.",
    "items": [
      {
        "id": "titular",
        "title": "01 · Who is behind it",
        "content": "José Luis Echezarreta Fabregó, promoter of the XpertAuth project.\nL'Escala (Girona).\nEmail: [info@xpertauth.com](mailto:info@xpertauth.com)\n\nXpertAuth is a personal project, an association whose incorporation is being studied. It has no commercial activity: it does not charge or invoice anything, and it does not sign contracts or commitments on behalf of any entity."
      },
      {
        "id": "oferta",
        "title": "02 · What this website offers",
        "content": "- **LEX:** guidance on special road transport regulations, based on our own regulatory database.\n- **NOVA:** practical ideas for using artificial intelligence in a transport SME.\n- **Blog:** articles on regulations and on the reality of the sector.\n- **Contact and appointments:** to raise a specific case.\n\n**What XpertAuth does not do:**\n- It does not handle any procedure with the authorities (DGT, SCT or any other body). It gives guidance; the procedure is done by you or your administrative agent (gestor).\n- It does not draft or sign reports, appeals or statements of defence against fines with legal liability. Those documents are prepared and signed by a qualified professional."
      },
      {
        "id": "lex-nova",
        "title": "03 · About LEX and NOVA",
        "content": "- They are artificial intelligence assistants. Their answers are generated automatically, without a person reviewing them before they are shown to you, and **may contain errors**.\n- They are for guidance only. Before making a decision with legal or financial consequences, check the information against the official source or with a professional.\n- To use them you must sign up with Google and be 18 or older. Each account has a limited number of queries per month.\n- We ask you to use them reasonably: do not try to get around the limits or use the assistants for purposes unrelated to transport."
      },
      {
        "id": "propiedad",
        "title": "04 · Intellectual property",
        "content": "- The texts, images, logos and design of this website belong to XpertAuth or are used with permission. Do not reproduce them without authorisation, except for personal, non-commercial use.\n- The official regulations that are cited (BOE, DOGC and other official gazettes) are in the public domain.\n- Some of the images and texts were created with the help of artificial intelligence and reviewed by a person, as stated at the foot of every page."
      },
      {
        "id": "responsabilidad",
        "title": "05 · Liability",
        "content": "We take the greatest care to make the information correct, but regulations change and there may be errors or omissions. For this reason we cannot guarantee that everything is complete and up to date at every moment. If you spot an error, write to us: we appreciate it and we will correct it."
      },
      {
        "id": "enlaces",
        "title": "06 · Links to other websites",
        "content": "This website links to third-party sites: official bodies (DGT, SCT, Generalitat, BOE, DOGC), the Google appointment calendar and social networks (LinkedIn, Instagram and WhatsApp). We do not control those sites or answer for their content. Linking to them does not imply any commercial relationship."
      },
      {
        "id": "legislacion",
        "title": "07 · Applicable law",
        "content": "This website is governed by Spanish law, in particular Law 34/2002 on Information Society Services (LSSI-CE), the General Data Protection Regulation (GDPR) and Organic Law 3/2018 on Data Protection (LOPDGDD). For any dispute, the courts and tribunals that have jurisdiction under the law will be competent."
      },
      {
        "id": "cambios",
        "title": "08 · Changes",
        "content": "If something important changes, we will update this page and the date above."
      }
    ]
  },
  "fr": {
    "title": "Mentions légales",
    "updated": "Dernière mise à jour : octobre 2026",
    "intro": "Nous expliquons ici qui est derrière ce site, ce qu'il propose et dans quelles conditions vous pouvez l'utiliser.",
    "items": [
      {
        "id": "titular",
        "title": "01 · Qui est derrière",
        "content": "José Luis Echezarreta Fabregó, promoteur du projet XpertAuth.\nL'Escala (Gérone).\nE-mail : [info@xpertauth.com](mailto:info@xpertauth.com)\n\nXpertAuth est un projet personnel, une association dont la constitution est à l'étude. Il n'a pas d'activité commerciale : il ne facture ni n'encaisse rien, et ne signe ni contrats ni engagements au nom d'aucune entité."
      },
      {
        "id": "oferta",
        "title": "02 · Ce que propose ce site",
        "content": "- **LEX :** orientation sur la réglementation du transport spécial par route, fondée sur une base réglementaire propre.\n- **NOVA :** idées pratiques pour utiliser l'intelligence artificielle dans une PME de transport.\n- **Blog :** articles sur la réglementation et sur la réalité du secteur.\n- **Contact et rendez-vous :** pour exposer un cas concret.\n\n**Ce que XpertAuth ne fait pas :**\n- Il n'effectue aucune démarche auprès de l'administration (DGT, SCT ou tout autre organisme). Il oriente ; la démarche, c'est vous ou votre gestionnaire (gestor) qui l'effectuez.\n- Il ne rédige ni ne signe de rapports, de recours ou de mémoires en défense contre des sanctions engageant une responsabilité légale. Ces documents sont préparés et signés par un professionnel habilité."
      },
      {
        "id": "lex-nova",
        "title": "03 · À propos de LEX et NOVA",
        "content": "- Ce sont des assistants d'intelligence artificielle. Leurs réponses sont générées automatiquement, sans qu'une personne les relise avant de vous les montrer, et **peuvent contenir des erreurs**.\n- Elles sont données à titre indicatif. Avant de prendre une décision aux conséquences juridiques ou économiques, vérifiez l'information auprès de la source officielle ou d'un professionnel.\n- Pour les utiliser, vous devez vous inscrire avec Google et avoir au moins 18 ans. Chaque compte dispose d'un nombre limité de consultations par mois.\n- Nous vous demandons un usage raisonnable : n'essayez pas de contourner les limites ni d'utiliser les assistants à des fins étrangères au transport."
      },
      {
        "id": "propiedad",
        "title": "04 · Propriété intellectuelle",
        "content": "- Les textes, images, logos et le design de ce site appartiennent à XpertAuth ou sont utilisés avec autorisation. Ne les reproduisez pas sans autorisation, sauf pour un usage personnel et non commercial.\n- Les textes officiels cités (BOE, DOGC et autres journaux officiels) sont dans le domaine public.\n- Une partie des images et des textes a été créée avec l'aide de l'intelligence artificielle et relue par une personne, comme indiqué en bas de chaque page."
      },
      {
        "id": "responsabilidad",
        "title": "05 · Responsabilité",
        "content": "Nous veillons avec le plus grand soin à l'exactitude des informations, mais la réglementation évolue et des erreurs ou omissions sont possibles. C'est pourquoi nous ne pouvons pas garantir que tout soit complet et à jour à chaque instant. Si vous repérez une erreur, écrivez-nous : nous vous en remercions et nous la corrigeons."
      },
      {
        "id": "enlaces",
        "title": "06 · Liens vers d'autres sites",
        "content": "Ce site renvoie vers des sites de tiers : organismes officiels (DGT, SCT, Generalitat, BOE, DOGC), le calendrier de rendez-vous de Google et des réseaux sociaux (LinkedIn, Instagram et WhatsApp). Nous ne contrôlons pas ces sites et ne répondons pas de leur contenu. Un lien vers eux n'implique aucune relation commerciale."
      },
      {
        "id": "legislacion",
        "title": "07 · Législation applicable",
        "content": "Ce site est régi par la législation espagnole, en particulier la loi 34/2002 sur les services de la société de l'information (LSSI-CE), le Règlement général sur la protection des données (RGPD) et la loi organique 3/2018 sur la protection des données (LOPDGDD). Pour tout litige, les juridictions compétentes seront celles désignées par la loi."
      },
      {
        "id": "cambios",
        "title": "08 · Modifications",
        "content": "Si quelque chose d'important change, nous mettrons à jour cette page et la date ci-dessus."
      }
    ]
  }
};

export default function AvisoLegal() {
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
