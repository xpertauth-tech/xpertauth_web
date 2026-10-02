import { useEffect } from "react";
import { useParams } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import LegalText, { Inline } from "@/components/legal-text";

type Item = { id: string; title: string; content: string; table?: { headers: string[]; rows: string[][] }; after?: string };
type Doc = { title: string; updated: string; intro: string; items: Item[] };

const data: Record<string, Doc> = {
  "es": {
    "title": "Política de cookies",
    "updated": "Última actualización: octubre de 2026",
    "intro": "",
    "items": [
      {
        "id": "resumen",
        "title": "01 · En resumen",
        "content": "Esta web **no usa cookies**. Tampoco usa herramientas de publicidad ni de seguimiento. Solo guarda en tu navegador lo imprescindible para funcionar: tu idioma, que ya has visto el aviso y, si entras con Google, tu sesión."
      },
      {
        "id": "que-son",
        "title": "02 · Qué son las cookies y el almacenamiento local",
        "content": "Las cookies son pequeños archivos que algunas webs guardan en tu dispositivo. El almacenamiento local es un mecanismo parecido: un espacio de tu navegador donde una web puede guardar datos. Esta web solo usa el almacenamiento local, y únicamente para lo siguiente."
      },
      {
        "id": "guardamos",
        "title": "03 · Qué guardamos en tu navegador",
        "content": "",
        "table": {
          "headers": [
            "Qué",
            "Para qué",
            "Cuánto dura"
          ],
          "rows": [
            [
              "Idioma (`xpertauth-locale`)",
              "Recordar el idioma que elegiste",
              "Hasta que borres los datos del navegador"
            ],
            [
              "Aviso visto (`xpertauth_cookie_consent`)",
              "No volver a mostrarte el aviso inicial",
              "Hasta que borres los datos del navegador"
            ],
            [
              "Sesión (`sb-supabase-auth-token`)",
              "Mantenerte dentro tras entrar con Google. Solo existe si te registras",
              "Hasta que cierres sesión"
            ],
            [
              "Agente pendiente (`xpertauth_pending_agent`)",
              "Abrir LEX o NOVA al volver del inicio de sesión de Google",
              "Se borra sola al volver o al cerrar la pestaña"
            ]
          ]
        },
        "after": "Todo esto es técnicamente necesario para que la web funcione. Por eso la ley no exige pedirte permiso, pero queremos que sepas qué es."
      },
      {
        "id": "medicion",
        "title": "04 · Medición de visitas",
        "content": "Contamos las visitas con Plausible, instalado en nuestro propio servidor en la Unión Europea. **No guarda nada en tu navegador**, no te identifica y no te sigue por otras webs. Solo nos dice cuántas personas visitan cada página y desde dónde llegan, de forma anónima."
      },
      {
        "id": "no-hacemos",
        "title": "05 · Lo que no hacemos",
        "content": "- No usamos Google Analytics ni otras analíticas de terceros.\n- No usamos píxeles de Meta, X ni de ninguna red social.\n- No mostramos publicidad.\n- Las fuentes de letra y las imágenes se sirven desde nuestros propios servidores: al abrir la web no se contacta con Google ni con otras empresas."
      },
      {
        "id": "salir",
        "title": "06 · Cuando sales de esta web",
        "content": "Si pulsas en el inicio de sesión con Google, en el calendario de citas o en los enlaces a LinkedIn, Instagram o WhatsApp, pasas a la web de esa empresa, que puede usar sus propias cookies según su política."
      },
      {
        "id": "borrar",
        "title": "07 · Cómo borrar lo guardado",
        "content": "- Al **cerrar sesión**, se borra tu sesión.\n- Para borrar todo lo demás, usa la opción de tu navegador para eliminar los datos de los sitios web (en Chrome, Safari, Firefox o Edge, dentro de Privacidad). Si lo haces, la web volverá a preguntarte el idioma y a mostrarte el aviso."
      },
      {
        "id": "cambios",
        "title": "08 · Cambios",
        "content": "Si algún día añadimos algo que necesite tu permiso, actualizaremos esta página y te lo pediremos antes de activarlo.\n\nDudas: [info@xpertauth.com](mailto:info@xpertauth.com)"
      }
    ]
  },
  "ca": {
    "title": "Política de galetes",
    "updated": "Darrera actualització: octubre de 2026",
    "intro": "",
    "items": [
      {
        "id": "resumen",
        "title": "01 · En resum",
        "content": "Aquest web **no fa servir galetes**. Tampoc fa servir eines de publicitat ni de seguiment. Només guarda al teu navegador el que és imprescindible per funcionar: el teu idioma, que ja has vist l'avís i, si entres amb Google, la teva sessió."
      },
      {
        "id": "que-son",
        "title": "02 · Què són les galetes i l'emmagatzematge local",
        "content": "Les galetes són petits fitxers que algunes webs guarden al teu dispositiu. L'emmagatzematge local és un mecanisme semblant: un espai del teu navegador on un web pot guardar dades. Aquest web només fa servir l'emmagatzematge local, i únicament per al següent."
      },
      {
        "id": "guardamos",
        "title": "03 · Què guardem al teu navegador",
        "content": "",
        "table": {
          "headers": [
            "Què",
            "Per a què",
            "Quant dura"
          ],
          "rows": [
            [
              "Idioma (`xpertauth-locale`)",
              "Recordar l'idioma que vas triar",
              "Fins que esborris les dades del navegador"
            ],
            [
              "Avís vist (`xpertauth_cookie_consent`)",
              "No tornar a mostrar-te l'avís inicial",
              "Fins que esborris les dades del navegador"
            ],
            [
              "Sessió (`sb-supabase-auth-token`)",
              "Mantenir-te dins després d'entrar amb Google. Només existeix si et registres",
              "Fins que tanquis la sessió"
            ],
            [
              "Agent pendent (`xpertauth_pending_agent`)",
              "Obrir LEX o NOVA en tornar de l'inici de sessió de Google",
              "S'esborra sola en tornar o en tancar la pestanya"
            ]
          ]
        },
        "after": "Tot això és tècnicament necessari perquè el web funcioni. Per això la llei no exigeix demanar-te permís, però volem que sàpigues què és."
      },
      {
        "id": "medicion",
        "title": "04 · Mesurament de visites",
        "content": "Comptem les visites amb Plausible, instal·lat al nostre propi servidor a la Unió Europea. **No guarda res al teu navegador**, no t'identifica i no et segueix per altres webs. Només ens diu quantes persones visiten cada pàgina i des d'on arriben, de manera anònima."
      },
      {
        "id": "no-hacemos",
        "title": "05 · El que no fem",
        "content": "- No fem servir Google Analytics ni altres analítiques de tercers.\n- No fem servir píxels de Meta, X ni de cap xarxa social.\n- No mostrem publicitat.\n- Les fonts de lletra i les imatges es serveixen des dels nostres propis servidors: en obrir el web no es contacta amb Google ni amb altres empreses."
      },
      {
        "id": "salir",
        "title": "06 · Quan surts d'aquest web",
        "content": "Si prems l'inici de sessió amb Google, el calendari de cites o els enllaços a LinkedIn, Instagram o WhatsApp, passes al web d'aquesta empresa, que pot fer servir les seves pròpies galetes segons la seva política."
      },
      {
        "id": "borrar",
        "title": "07 · Com esborrar el que s'ha guardat",
        "content": "- En **tancar la sessió**, s'esborra la teva sessió.\n- Per esborrar tota la resta, fes servir l'opció del teu navegador per eliminar les dades dels llocs web (a Chrome, Safari, Firefox o Edge, dins de Privadesa). Si ho fas, el web et tornarà a preguntar l'idioma i a mostrar-te l'avís."
      },
      {
        "id": "cambios",
        "title": "08 · Canvis",
        "content": "Si algun dia afegim alguna cosa que necessiti el teu permís, actualitzarem aquesta pàgina i te'l demanarem abans d'activar-ho.\n\nDubtes: [info@xpertauth.com](mailto:info@xpertauth.com)"
      }
    ]
  },
  "en": {
    "title": "Cookie policy",
    "updated": "Last updated: October 2026",
    "intro": "",
    "items": [
      {
        "id": "resumen",
        "title": "01 · In short",
        "content": "This website **does not use cookies**. It does not use advertising or tracking tools either. It only stores in your browser what is essential for it to work: your language, the fact that you have seen the notice and, if you sign in with Google, your session."
      },
      {
        "id": "que-son",
        "title": "02 · What cookies and local storage are",
        "content": "Cookies are small files that some websites save on your device. Local storage is a similar mechanism: a space in your browser where a website can save data. This website only uses local storage, and only for the following."
      },
      {
        "id": "guardamos",
        "title": "03 · What we store in your browser",
        "content": "",
        "table": {
          "headers": [
            "What",
            "What for",
            "How long"
          ],
          "rows": [
            [
              "Language (`xpertauth-locale`)",
              "To remember the language you chose",
              "Until you clear your browser data"
            ],
            [
              "Notice seen (`xpertauth_cookie_consent`)",
              "So the initial notice is not shown to you again",
              "Until you clear your browser data"
            ],
            [
              "Session (`sb-supabase-auth-token`)",
              "To keep you signed in after signing in with Google. It only exists if you sign up",
              "Until you sign out"
            ],
            [
              "Pending agent (`xpertauth_pending_agent`)",
              "To open LEX or NOVA when you return from Google sign-in",
              "It deletes itself on return or when you close the tab"
            ]
          ]
        },
        "after": "All of this is technically necessary for the website to work. That is why the law does not require asking your permission, but we want you to know what it is."
      },
      {
        "id": "medicion",
        "title": "04 · Visit measurement",
        "content": "We count visits with Plausible, installed on our own server in the European Union. **It stores nothing in your browser**, does not identify you and does not follow you across other websites. It only tells us how many people visit each page and where they come from, anonymously."
      },
      {
        "id": "no-hacemos",
        "title": "05 · What we do not do",
        "content": "- We do not use Google Analytics or other third-party analytics.\n- We do not use pixels from Meta, X or any social network.\n- We do not show advertising.\n- Fonts and images are served from our own servers: when you open the website, no contact is made with Google or other companies."
      },
      {
        "id": "salir",
        "title": "06 · When you leave this website",
        "content": "If you click on Google sign-in, the appointment calendar or the links to LinkedIn, Instagram or WhatsApp, you go to that company's website, which may use its own cookies under its own policy."
      },
      {
        "id": "borrar",
        "title": "07 · How to delete what is stored",
        "content": "- When you **sign out**, your session is deleted.\n- To delete everything else, use your browser's option to delete website data (in Chrome, Safari, Firefox or Edge, under Privacy). If you do, the website will ask you for your language again and show you the notice again."
      },
      {
        "id": "cambios",
        "title": "08 · Changes",
        "content": "If one day we add something that needs your permission, we will update this page and ask you before turning it on.\n\nQuestions: [info@xpertauth.com](mailto:info@xpertauth.com)"
      }
    ]
  },
  "fr": {
    "title": "Politique de cookies",
    "updated": "Dernière mise à jour : octobre 2026",
    "intro": "",
    "items": [
      {
        "id": "resumen",
        "title": "01 · En résumé",
        "content": "Ce site **n'utilise pas de cookies**. Il n'utilise pas non plus d'outils de publicité ni de suivi. Il enregistre seulement dans votre navigateur le strict nécessaire pour fonctionner : votre langue, le fait que vous avez vu l'avis et, si vous vous connectez avec Google, votre session."
      },
      {
        "id": "que-son",
        "title": "02 · Que sont les cookies et le stockage local",
        "content": "Les cookies sont de petits fichiers que certains sites enregistrent sur votre appareil. Le stockage local est un mécanisme similaire : un espace de votre navigateur où un site peut enregistrer des données. Ce site n'utilise que le stockage local, et uniquement pour ce qui suit."
      },
      {
        "id": "guardamos",
        "title": "03 · Ce que nous enregistrons dans votre navigateur",
        "content": "",
        "table": {
          "headers": [
            "Quoi",
            "Pourquoi",
            "Durée"
          ],
          "rows": [
            [
              "Langue (`xpertauth-locale`)",
              "Mémoriser la langue que vous avez choisie",
              "Jusqu'à ce que vous effaciez les données du navigateur"
            ],
            [
              "Avis vu (`xpertauth_cookie_consent`)",
              "Ne plus vous afficher l'avis initial",
              "Jusqu'à ce que vous effaciez les données du navigateur"
            ],
            [
              "Session (`sb-supabase-auth-token`)",
              "Vous garder connecté après la connexion avec Google. N'existe que si vous vous inscrivez",
              "Jusqu'à ce que vous vous déconnectiez"
            ],
            [
              "Agent en attente (`xpertauth_pending_agent`)",
              "Ouvrir LEX ou NOVA au retour de la connexion Google",
              "S'efface seul au retour ou à la fermeture de l'onglet"
            ]
          ]
        },
        "after": "Tout cela est techniquement nécessaire au fonctionnement du site. C'est pourquoi la loi n'exige pas de vous demander votre autorisation, mais nous voulons que vous sachiez de quoi il s'agit."
      },
      {
        "id": "medicion",
        "title": "04 · Mesure des visites",
        "content": "Nous comptons les visites avec Plausible, installé sur notre propre serveur dans l'Union européenne. **Il n'enregistre rien dans votre navigateur**, ne vous identifie pas et ne vous suit pas sur d'autres sites. Il nous indique seulement combien de personnes visitent chaque page et d'où elles viennent, de façon anonyme."
      },
      {
        "id": "no-hacemos",
        "title": "05 · Ce que nous ne faisons pas",
        "content": "- Nous n'utilisons pas Google Analytics ni d'autres outils d'analyse tiers.\n- Nous n'utilisons pas de pixels de Meta, de X ni d'aucun réseau social.\n- Nous n'affichons pas de publicité.\n- Les polices de caractères et les images sont servies depuis nos propres serveurs : à l'ouverture du site, aucun contact n'est établi avec Google ni avec d'autres entreprises."
      },
      {
        "id": "salir",
        "title": "06 · Quand vous quittez ce site",
        "content": "Si vous cliquez sur la connexion avec Google, sur le calendrier de rendez-vous ou sur les liens vers LinkedIn, Instagram ou WhatsApp, vous passez sur le site de cette entreprise, qui peut utiliser ses propres cookies selon sa politique."
      },
      {
        "id": "borrar",
        "title": "07 · Comment effacer ce qui est enregistré",
        "content": "- Quand vous **vous déconnectez**, votre session est effacée.\n- Pour effacer tout le reste, utilisez l'option de votre navigateur pour supprimer les données des sites web (dans Chrome, Safari, Firefox ou Edge, dans Confidentialité). Si vous le faites, le site vous redemandera la langue et vous affichera de nouveau l'avis."
      },
      {
        "id": "cambios",
        "title": "08 · Modifications",
        "content": "Si un jour nous ajoutons quelque chose qui nécessite votre autorisation, nous mettrons à jour cette page et vous la demanderons avant de l'activer.\n\nQuestions : [info@xpertauth.com](mailto:info@xpertauth.com)"
      }
    ]
  }
};

export default function PoliticaCookies() {
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
              {item.table && (
                <div className="my-4 bg-[#0A0E1A] border border-white/8 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-3 bg-white/5 px-4 sm:px-5 py-3 text-xs font-bold text-white/40 uppercase tracking-wider gap-3 sm:gap-4">
                    {item.table.headers.map((h, i) => (
                      <span key={i}>{h}</span>
                    ))}
                  </div>
                  {item.table.rows.map((row, i) => (
                    <div key={i} className="grid grid-cols-3 px-4 sm:px-5 py-3.5 border-t border-white/5 text-sm text-white/60 gap-3 sm:gap-4">
                      <span className="text-white/80 font-medium break-words"><Inline text={row[0]} /></span>
                      <span>{row[1]}</span>
                      <span className="text-[#4D9FEC]">{row[2]}</span>
                    </div>
                  ))}
                </div>
              )}
              {item.after && <LegalText text={item.after} />}
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
