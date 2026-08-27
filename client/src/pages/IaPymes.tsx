import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactModal from "@/components/ContactModal";
import { useAgent } from "@/App";
import { Calendar } from "lucide-react";

const gradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
  backgroundSize: "300% 300%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "snGrad 6s ease infinite",
};

// ─── Hook scroll reveal ───────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealDiv({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Datos casos de uso — por locale ─────────────────────────────────────────
type CasoUso = {
  num: string;
  titulo: string;
  descripcion: string;
  herramientas: { nombre: string; color: string }[];
  transporte: boolean;
};

const casosUsoByLocale: Record<string, CasoUso[]> = {
  es: [
    {
      num: "01",
      titulo: "Clasificar emails y registrar incidencias",
      descripcion: "Cada email de cliente se clasifica por tipo automaticamente. Las incidencias se registran en Sheets y se confirma la recepcion al cliente sin intervenir.",
      herramientas: [
        { nombre: "Gmail", color: "#EA4335" },
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "02",
      titulo: "Nuevo lead entra solo en CRM con bienvenida",
      descripcion: "El formulario web crea el contacto en tu CRM y dispara un email de bienvenida personalizado. Sin tocar nada.",
      herramientas: [
        { nombre: "Formulario", color: "#7B68EE" },
        { nombre: "HubSpot", color: "#FF6B35" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "03",
      titulo: "Mensaje de cliente genera tarea al equipo",
      descripcion: "Un mensaje de cliente en WhatsApp crea automaticamente una tarea en Notion y notifica al responsable en Slack.",
      herramientas: [
        { nombre: "WhatsApp", color: "#25D366" },
        { nombre: "Notion", color: "#888888" },
        { nombre: "Slack", color: "#4A154B" },
      ],
      transporte: false,
    },
    {
      num: "04",
      titulo: "Extrae datos de facturas a tu hoja de costes",
      descripcion: "Subes la factura PDF a Drive. La IA extrae importe, proveedor y fecha. Los datos se vuelcan solos en tu hoja de contabilidad.",
      herramientas: [
        { nombre: "Drive", color: "#4285F4" },
        { nombre: "IA", color: "#8B5CF6" },
        { nombre: "Sheets", color: "#34A853" },
      ],
      transporte: false,
    },
    {
      num: "05",
      titulo: "Recordatorio automatico de cita al cliente",
      descripcion: "Creas el evento en Calendar. 24h antes el cliente recibe automaticamente un WhatsApp con la confirmacion y los detalles.",
      herramientas: [
        { nombre: "Calendar", color: "#4285F4" },
        { nombre: "WhatsApp", color: "#25D366" },
      ],
      transporte: false,
    },
    {
      num: "06",
      titulo: "Informe semanal de ventas sin tocarlo",
      descripcion: "Cada lunes a las 8h se genera el informe de ventas de la semana anterior y se envia automaticamente a los responsables.",
      herramientas: [
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "PDF", color: "#F72585" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "07",
      titulo: "Recepcion de eCMR y registro automatico",
      descripcion: "El eCMR llega por email. La IA extrae matricula, origen, destino y fecha. Se registra en tu hoja de servicios y se archiva en Drive.",
      herramientas: [
        { nombre: "Email", color: "#EA4335" },
        { nombre: "IA", color: "#8B5CF6" },
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Drive", color: "#4285F4" },
      ],
      transporte: true,
    },
    {
      num: "08",
      titulo: "Facturacion automatica al cerrar el servicio",
      descripcion: "Al marcar el servicio como completado en Sheets, se genera la factura en Sage y se envia automaticamente al cliente por email.",
      herramientas: [
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Sage", color: "#00DC82" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: true,
    },
  ],
  ca: [
    {
      num: "01",
      titulo: "Classificar emails i registrar incidencies",
      descripcion: "Cada email de client es classifica per tipus automaticament. Les incidencies es registren a Sheets i es confirma la recepcio al client sense intervenir.",
      herramientas: [
        { nombre: "Gmail", color: "#EA4335" },
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "02",
      titulo: "Nou lead entra sol al CRM amb benvinguda",
      descripcion: "El formulari web crea el contacte al teu CRM i dispara un email de benvinguda personalitzat. Sense tocar res.",
      herramientas: [
        { nombre: "Formulario", color: "#7B68EE" },
        { nombre: "HubSpot", color: "#FF6B35" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "03",
      titulo: "Missatge de client genera tasca a l'equip",
      descripcion: "Un missatge de client a WhatsApp crea automaticament una tasca a Notion i notifica el responsable a Slack.",
      herramientas: [
        { nombre: "WhatsApp", color: "#25D366" },
        { nombre: "Notion", color: "#888888" },
        { nombre: "Slack", color: "#4A154B" },
      ],
      transporte: false,
    },
    {
      num: "04",
      titulo: "Extreu dades de factures al full de costos",
      descripcion: "Puges la factura PDF a Drive. La IA extreu import, proveidora i data. Les dades s'aboquen soles al teu full de comptabilitat.",
      herramientas: [
        { nombre: "Drive", color: "#4285F4" },
        { nombre: "IA", color: "#8B5CF6" },
        { nombre: "Sheets", color: "#34A853" },
      ],
      transporte: false,
    },
    {
      num: "05",
      titulo: "Recordatori automatic de cita al client",
      descripcion: "Crees l'event a Calendar. 24h abans el client rep automaticament un WhatsApp amb la confirmacio i els detalls.",
      herramientas: [
        { nombre: "Calendar", color: "#4285F4" },
        { nombre: "WhatsApp", color: "#25D366" },
      ],
      transporte: false,
    },
    {
      num: "06",
      titulo: "Informe setmanal de vendes sense tocar-lo",
      descripcion: "Cada dilluns a les 8h es genera l'informe de vendes de la setmana anterior i s'envia automaticament als responsables.",
      herramientas: [
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "PDF", color: "#F72585" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "07",
      titulo: "Recepcio d'eCMR i registre automatic",
      descripcion: "L'eCMR arriba per email. La IA extreu matricula, origen, desti i data. Es registra al teu full de serveis i s'arxiva a Drive.",
      herramientas: [
        { nombre: "Email", color: "#EA4335" },
        { nombre: "IA", color: "#8B5CF6" },
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Drive", color: "#4285F4" },
      ],
      transporte: true,
    },
    {
      num: "08",
      titulo: "Facturacio automatica en tancar el servei",
      descripcion: "En marcar el servei com a completat a Sheets, es genera la factura a Sage i s'envia automaticament al client per email.",
      herramientas: [
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Sage", color: "#00DC82" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: true,
    },
  ],
  en: [
    {
      num: "01",
      titulo: "Classify emails and log incidents",
      descripcion: "Every customer email is classified by type automatically. Incidents are logged in Sheets and the customer receives a confirmation without anyone intervening.",
      herramientas: [
        { nombre: "Gmail", color: "#EA4335" },
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "02",
      titulo: "New lead enters CRM alone with welcome email",
      descripcion: "The web form creates the contact in your CRM and triggers a personalised welcome email. No manual input needed.",
      herramientas: [
        { nombre: "Formulario", color: "#7B68EE" },
        { nombre: "HubSpot", color: "#FF6B35" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "03",
      titulo: "Customer message creates team task",
      descripcion: "A customer WhatsApp message automatically creates a task in Notion and notifies the responsible person in Slack.",
      herramientas: [
        { nombre: "WhatsApp", color: "#25D366" },
        { nombre: "Notion", color: "#888888" },
        { nombre: "Slack", color: "#4A154B" },
      ],
      transporte: false,
    },
    {
      num: "04",
      titulo: "Extract invoice data to your cost sheet",
      descripcion: "Upload the PDF invoice to Drive. AI extracts amount, supplier and date. The data flows automatically into your accounting spreadsheet.",
      herramientas: [
        { nombre: "Drive", color: "#4285F4" },
        { nombre: "IA", color: "#8B5CF6" },
        { nombre: "Sheets", color: "#34A853" },
      ],
      transporte: false,
    },
    {
      num: "05",
      titulo: "Automatic appointment reminder to customer",
      descripcion: "You create the event in Calendar. 24h before, the customer automatically receives a WhatsApp with the confirmation and details.",
      herramientas: [
        { nombre: "Calendar", color: "#4285F4" },
        { nombre: "WhatsApp", color: "#25D366" },
      ],
      transporte: false,
    },
    {
      num: "06",
      titulo: "Weekly sales report without touching it",
      descripcion: "Every Monday at 8am the previous week's sales report is generated and automatically sent to the relevant people.",
      herramientas: [
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "PDF", color: "#F72585" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "07",
      titulo: "eCMR reception and automatic logging",
      descripcion: "The eCMR arrives by email. AI extracts plate number, origin, destination and date. It is logged in your services sheet and archived in Drive.",
      herramientas: [
        { nombre: "Email", color: "#EA4335" },
        { nombre: "IA", color: "#8B5CF6" },
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Drive", color: "#4285F4" },
      ],
      transporte: true,
    },
    {
      num: "08",
      titulo: "Automatic invoicing when closing the job",
      descripcion: "When you mark the job as completed in Sheets, the invoice is generated in Sage and automatically sent to the customer by email.",
      herramientas: [
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Sage", color: "#00DC82" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: true,
    },
  ],
  fr: [
    {
      num: "01",
      titulo: "Classer les emails et enregistrer les incidents",
      descripcion: "Chaque email client est classe par type automatiquement. Les incidents sont enregistres dans Sheets et la reception est confirmee au client sans intervention.",
      herramientas: [
        { nombre: "Gmail", color: "#EA4335" },
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "02",
      titulo: "Nouveau lead entre seul dans le CRM avec accueil",
      descripcion: "Le formulaire web cree le contact dans votre CRM et declenche un email de bienvenue personnalise. Sans rien toucher.",
      herramientas: [
        { nombre: "Formulario", color: "#7B68EE" },
        { nombre: "HubSpot", color: "#FF6B35" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "03",
      titulo: "Message client genere une tache pour l'equipe",
      descripcion: "Un message client sur WhatsApp cree automatiquement une tache dans Notion et notifie le responsable sur Slack.",
      herramientas: [
        { nombre: "WhatsApp", color: "#25D366" },
        { nombre: "Notion", color: "#888888" },
        { nombre: "Slack", color: "#4A154B" },
      ],
      transporte: false,
    },
    {
      num: "04",
      titulo: "Extraire les donnees de factures vers votre feuille de couts",
      descripcion: "Vous deposez la facture PDF dans Drive. L'IA extrait le montant, le fournisseur et la date. Les donnees se versent seules dans votre feuille de comptabilite.",
      herramientas: [
        { nombre: "Drive", color: "#4285F4" },
        { nombre: "IA", color: "#8B5CF6" },
        { nombre: "Sheets", color: "#34A853" },
      ],
      transporte: false,
    },
    {
      num: "05",
      titulo: "Rappel automatique de rendez-vous au client",
      descripcion: "Vous creez l'evenement dans Calendar. 24h avant, le client recoit automatiquement un WhatsApp avec la confirmation et les details.",
      herramientas: [
        { nombre: "Calendar", color: "#4285F4" },
        { nombre: "WhatsApp", color: "#25D366" },
      ],
      transporte: false,
    },
    {
      num: "06",
      titulo: "Rapport hebdomadaire des ventes sans y toucher",
      descripcion: "Chaque lundi a 8h le rapport des ventes de la semaine precedente est genere et envoye automatiquement aux responsables.",
      herramientas: [
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "PDF", color: "#F72585" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: false,
    },
    {
      num: "07",
      titulo: "Reception d'eCMR et enregistrement automatique",
      descripcion: "L'eCMR arrive par email. L'IA extrait l'immatriculation, l'origine, la destination et la date. Il est enregistre dans votre feuille et archive dans Drive.",
      herramientas: [
        { nombre: "Email", color: "#EA4335" },
        { nombre: "IA", color: "#8B5CF6" },
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Drive", color: "#4285F4" },
      ],
      transporte: true,
    },
    {
      num: "08",
      titulo: "Facturation automatique a la cloture du service",
      descripcion: "Quand vous marquez le service comme termine dans Sheets, la facture est generee dans Sage et envoyee automatiquement au client par email.",
      herramientas: [
        { nombre: "Sheets", color: "#34A853" },
        { nombre: "Sage", color: "#00DC82" },
        { nombre: "Gmail", color: "#EA4335" },
      ],
      transporte: true,
    },
  ],
};

// ─── Logos reales herramientas ────────────────────────────────────────────────
type ToolConfig = { url?: string; renderIcon?: () => React.ReactNode; bg: string; border: string };

const toolLogos: Record<string, ToolConfig> = {
  Gmail:      { url: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg", bg: "rgba(234,67,53,0.15)", border: "rgba(234,67,53,0.4)" },
  Email:      { url: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg", bg: "rgba(234,67,53,0.15)", border: "rgba(234,67,53,0.4)" },
  Sheets:     { url: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Google_Sheets_2020_Logo.svg", bg: "rgba(52,168,83,0.15)", border: "rgba(52,168,83,0.4)" },
  Drive:      { url: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg", bg: "rgba(66,133,244,0.12)", border: "rgba(66,133,244,0.35)" },
  Calendar:   { url: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg", bg: "rgba(66,133,244,0.12)", border: "rgba(66,133,244,0.35)" },
  WhatsApp:   { url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg", bg: "rgba(37,211,102,0.15)", border: "rgba(37,211,102,0.4)" },
  Notion:     { url: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png", bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.2)" },
  Slack:      { renderIcon: () => (
    <svg viewBox="0 0 127 127" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80z" fill="white" fillOpacity=".9"/>
      <path d="M33.7 80c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="white" fillOpacity=".9"/>
      <path d="M46.9 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.7 6.7 39.6.8 46.9.8c7.3 0 13.2 5.9 13.2 13.2v13.2H46.9z" fill="white" fillOpacity=".7"/>
      <path d="M46.9 33.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9c0-7.3 5.9-13.2 13.2-13.2h33z" fill="white" fillOpacity=".7"/>
      <path d="M99.8 46.9c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.8V46.9z" fill="#36C5F0"/>
      <path d="M93.3 46.9c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.9C66.9 6.6 72.8.7 80.1.7c7.3 0 13.2 5.9 13.2 13.2v33z" fill="#36C5F0"/>
      <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2z" fill="#2EB67D"/>
      <path d="M80.1 93.3c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2h-33z" fill="#2EB67D"/>
    </svg>
  ), bg: "rgba(54,197,240,0.12)", border: "rgba(54,197,240,0.35)" },
  HubSpot:    { renderIcon: () => (
    <svg viewBox="0 0 512 512" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M331.7 212.9V156c17.9-7.4 30.5-25 30.5-45.6V109c0-27.3-22.1-49.5-49.5-49.5h-1.4c-27.3 0-49.5 22.1-49.5 49.5v1.4c0 20.6 12.6 38.3 30.5 45.6v56.9c-26.6 4.2-50.4 16.4-69.1 34.4L90.8 133.9a56.4 56.4 0 0 0 1.3-12.1C92.1 87.2 64.9 60 31.3 60S-29.5 87.2-29.5 120.8s27.2 60.8 60.8 60.8c11.3 0 21.9-3.1 30.9-8.5l131.3 112c-9 19.4-14 41-14 63.9 0 23.7 5.4 46.1 15 66.1l-39.8 39.8c-3.4-1.1-6.9-1.7-10.6-1.7-20.1 0-36.4 16.3-36.4 36.4S124.2 525 144.3 525s36.4-16.3 36.4-36.4c0-3.7-.6-7.2-1.7-10.6l39.3-39.3c21.3 13.7 46.6 21.7 73.8 21.7 75.4 0 136.7-61.2 136.7-136.7-.1-64.7-44.9-119-105.1-131.8zm-20.5 204c-40.9 0-74.1-33.2-74.1-74.1s33.2-74.1 74.1-74.1 74.1 33.2 74.1 74.1-33.2 74.1-74.1 74.1z" fill="white" fillOpacity=".9"/>
    </svg>
  ), bg: "rgba(255,107,53,0.15)", border: "rgba(255,107,53,0.4)" },
  Formulario: { url: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Google_Forms_office_logo.svg", bg: "rgba(123,104,238,0.15)", border: "rgba(123,104,238,0.4)" },
  PDF:        { url: "https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg", bg: "rgba(247,37,133,0.15)", border: "rgba(247,37,133,0.4)" },
  Sage:       { renderIcon: () => (
    <span style={{ color: "white", fontWeight: 700, fontSize: 13, letterSpacing: "-0.5px", opacity: 0.9, fontFamily: "Arial, sans-serif" }}>sage</span>
  ), bg: "rgba(0,180,100,0.15)", border: "rgba(0,180,100,0.4)" },
  IA:         { url: "https://supabase.xpertauth.com/storage/v1/object/public/web-images/logo/logo_xpertauth_icon_v1.png", bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.4)" },
};

// ─── Flecha animada con pulso de flujo ───────────────────────────────────────
function FlowArrow({ delay = 0 }: { delay?: number }) {
  return (
    <div className="relative flex items-center" style={{ width: 28, height: 20 }}>
      {/* SVG flecha base tenue */}
      <svg viewBox="0 0 28 14" width="28" height="14" fill="none" style={{ position: "absolute", inset: 0 }}>
        <path d="M2 7 H22 M18 3 L24 7 L18 11" stroke="rgba(255,255,255,0.15)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {/* SVG flecha que se ilumina con pulso */}
      <svg viewBox="0 0 28 14" width="28" height="14" fill="none"
        style={{
          position: "absolute", inset: 0,
          animation: `flowPulse 2s ease-in-out ${delay}s infinite`,
        }}
      >
        <defs>
          <linearGradient id={"fg" + Math.round(delay * 10)} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4D9FEC" stopOpacity="0"/>
            <stop offset="50%" stopColor="#4D9FEC" stopOpacity="1"/>
            <stop offset="100%" stopColor="#1B4FD8" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d="M2 7 H22 M18 3 L24 7 L18 11" stroke={"url(#fg" + Math.round(delay * 10) + ")"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {/* Partícula que viaja por la flecha */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "#4D9FEC",
          boxShadow: "0 0 6px 2px rgba(77,159,236,0.7)",
          transform: "translateY(-50%)",
          animation: `flowDot 2s ease-in-out ${delay}s infinite`,
        }}
      />
    </div>
  );
}

function ToolIcon({ nombre }: { nombre: string }) {
  const cfg = toolLogos[nombre] ?? { bg: "rgba(255,255,255,0.07)", border: "rgba(255,255,255,0.15)" };
  return (
    <div className="relative group flex-shrink-0">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: cfg.bg, border: "1px solid " + cfg.border }}
      >
        {cfg.renderIcon ? (
          cfg.renderIcon()
        ) : cfg.url ? (
          <img src={cfg.url} alt={nombre} className="w-5 h-5 object-contain" />
        ) : (
          // Fallback genérico
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <circle cx="12" cy="12" r="4" fill="white" fillOpacity=".3" stroke="white" strokeWidth="1.4"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="1.5" fill="#8B5CF6"/>
          </svg>
        )}
      </div>
      {/* Tooltip — aparece debajo para evitar recorte */}
      <div
        className="pointer-events-none absolute top-full left-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50"
        style={{ transform: "translateX(-50%)" }}
      >
        <div
          className="whitespace-nowrap rounded-md px-2 py-1 text-white font-medium"
          style={{ background: "#1e2a3a", border: "1px solid rgba(255,255,255,0.15)", fontSize: 11 }}
        >
          {nombre}
        </div>
      </div>
    </div>
  );
}
function CasoFlipCard({ caso, labelTransporte, labelGirar, labelVolver }: {
  caso: CasoUso;
  labelTransporte: string;
  labelGirar: string;
  labelVolver: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer"
      style={{ perspective: "1000px", height: "200px" }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(0.4,0.2,0.2,1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── CARA DELANTERA: logos ── */}
        <div
          style={{
            position: "absolute", inset: 0, backfaceVisibility: "hidden",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            display: "flex", flexDirection: "column",
            padding: "18px 20px",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(77,159,236,0.3)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
        >
          {/* Número + badge + indicador flip */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[#4D9FEC] text-xs font-bold tracking-widest font-mono">{caso.num}</span>
              {caso.transporte && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#4D9FEC]/20 text-[#4D9FEC]">
                  {labelTransporte}
                </span>
              )}
            </div>
            {/* Indicador de giro */}
            <div className="flex items-center gap-1 opacity-40">
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
                <path d="M2 8a6 6 0 0 1 10.5-4M14 4v4h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-white"/>
              </svg>
              <span className="text-white text-xs">{labelGirar}</span>
            </div>
          </div>

          {/* Logos centrados */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {caso.herramientas.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <ToolIcon nombre={h.nombre} />
                  {i < caso.herramientas.length - 1 && (
                    <FlowArrow delay={i * 0.4} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Título abajo */}
          <p className="text-white/75 text-sm text-center mt-3 leading-snug truncate">{caso.titulo}</p>
        </div>

        {/* ── CARA TRASERA: descripción ── */}
        <div
          style={{
            position: "absolute", inset: 0, backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "rgba(27,79,216,0.07)",
            border: "1px solid rgba(27,79,216,0.3)",
            borderRadius: 12,
            display: "flex", flexDirection: "column",
            padding: "18px 20px",
          }}
        >
          {/* Número + flujo */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#4D9FEC] text-xs font-bold tracking-widest font-mono">{caso.num}</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {caso.herramientas.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="text-white/60 text-xs">{h.nombre}</span>
                  {i < caso.herramientas.length - 1 && (
                    <span className="text-white/25 text-xs">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Título */}
          <h4 className="text-white font-semibold text-sm leading-snug mb-3">{caso.titulo}</h4>

          {/* Descripción */}
          <p className="text-white/75 text-sm leading-relaxed flex-1">{caso.descripcion}</p>

          {/* Hint para volver */}
          <div className="flex items-center justify-end gap-1 mt-3 opacity-35">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
              <path d="M14 8a6 6 0 0 1-10.5 4M2 12V8h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-white"/>
            </svg>
            <span className="text-white text-xs">{labelVolver}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Iconos por servicio ──────────────────────────────────────────────────────
const serviceIcons = [
  // 01 Auditoría
  { gradient: "linear-gradient(135deg,#1B4FD8,#4D9FEC)", icon: (
    <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
      <circle cx="18" cy="18" r="10" stroke="white" strokeWidth="2.5" strokeOpacity=".9"/>
      <path d="M25 25l7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M14 18h8M18 14v8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )},
  // 02 Consultoría
  { gradient: "linear-gradient(135deg,#4D9FEC,#7B68EE)", icon: (
    <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
      <rect x="6" y="10" width="28" height="20" rx="3" stroke="white" strokeWidth="2.2" strokeOpacity=".9"/>
      <path d="M13 18h14M13 23h9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="28" cy="14" r="5" fill="white" fillOpacity=".15" stroke="white" strokeWidth="1.5"/>
      <path d="M28 12v2l1.5 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )},
  // 03 Automatización
  { gradient: "linear-gradient(135deg,#8B5CF6,#4D9FEC)", icon: (
    <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
      <path d="M8 20a12 12 0 0 1 24 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeOpacity=".9"/>
      <path d="M20 8v6M14 10l3 5M26 10l-3 5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="26" r="5" stroke="white" strokeWidth="2" strokeOpacity=".9"/>
      <circle cx="20" cy="26" r="2" fill="white" fillOpacity=".7"/>
    </svg>
  )},
  // 04 Formación
  { gradient: "linear-gradient(135deg,#1B4FD8,#8B5CF6)", icon: (
    <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
      <path d="M20 10L6 17l14 7 14-7-14-7z" stroke="white" strokeWidth="2.2" strokeLinejoin="round" strokeOpacity=".9"/>
      <path d="M10 21v7c0 0 4 4 10 4s10-4 10-4v-7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M34 17v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )},
];

// ─── Tarjeta Problema/Solucion ────────────────────────────────────────────────
function ServiceCard({
  number, title, subtitle, problema, solucion, badge, index, labelProblema, labelSolucion,
}: {
  number: string; title: string; subtitle: string;
  problema: string; solucion: string; badge: string; index: number;
  labelProblema: string; labelSolucion: string;
}) {
  const iconCfg = serviceIcons[index] ?? serviceIcons[0];
  return (
    <div
      className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col gap-4 cursor-default"
      style={{ transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease" }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px) scale(1.01)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(77,159,236,0.35)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(27,79,216,0.18)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0) scale(1)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Header con icono grande */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: iconCfg.gradient, boxShadow: "0 4px 16px rgba(27,79,216,0.3)" }}
        >
          {iconCfg.icon}
        </div>
        <div>
          <h3 className="text-white font-semibold text-base leading-snug">{title}</h3>
          <p className="text-white/50 text-sm mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1.5">{labelProblema}</p>
        <p className="text-red-100 text-sm leading-relaxed">{problema}</p>
      </div>

      <div className="rounded-lg bg-[#1B4FD8]/10 border border-[#1B4FD8]/20 px-4 py-3">
        <p className="text-[#4D9FEC] text-xs font-bold uppercase tracking-widest mb-1.5">{labelSolucion}</p>
        <p className="text-white/90 text-sm leading-relaxed">{solucion}</p>
      </div>

      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#4D9FEC]/10 text-[#4D9FEC] self-start">
        {badge}
      </span>
    </div>
  );
}

// ─── Textos por idioma ────────────────────────────────────────────────────────
const texts: Record<string, {
  heroTitle1: string; heroTitle2: string; heroSubtitle: string;
  heroCtaSocio: string; heroCtaContacto: string;
  serviciosLabel: string; serviciosTitle: string; serviciosSubtitle: string;
  servicios: { num: string; title: string; subtitle: string; problema: string; solucion: string; badge: string }[];
  labelProblema: string; labelSolucion: string;
  casosLabel: string; casosTitle: string; casosSubtitle: string;
  labelTransporte: string; labelGirar: string; labelVolver: string;
  novaLabel: string; novaTitle: string; novaBody: string; novaBtn: string;
  novaPreguntas: string[];
  ctaTitle: string; ctaSubtitle: string; ctaSocio: string; ctaContacto: string;
}> = {
  es: {
    heroTitle1: "La IA no es solo para",
    heroTitle2: "grandes empresas.",
    heroSubtitle: "Automatizamos tus procesos, formamos a tu equipo y resolvemos los cuellos de botella reales de tu negocio. Sin vender tecnologia. Sin humo.",
    heroCtaSocio: "Hazte socio",
    heroCtaContacto: "Contacta con nosotros",
    serviciosLabel: "Lo que hacemos",
    serviciosTitle: "No vendemos soluciones. Resolvemos problemas.",
    serviciosSubtitle: "Antes de proponer nada, entendemos como trabajas.",
    servicios: [
      {
        num: "01", title: "Auditoria inicial", subtitle: "Gratuita · Sin compromiso",
        problema: "No sabes por donde empezar con la IA. Ves que otros la usan pero no tienes claro si te sirve a ti o que cambiarias primero.",
        solucion: "Mapeamos tu flujo de trabajo real, identificamos los cuellos de botella y te decimos exactamente donde la IA te ahorraria tiempo y dinero.",
        badge: "Sin coste · Sin presion",
      },
      {
        num: "02", title: "Consultoria de implementacion", subtitle: "Elegir bien antes de gastar",
        problema: "El mercado esta lleno de herramientas de IA. No sabes cual elegir, cual se integra con lo que ya tienes o si realmente vale lo que cuesta.",
        solucion: "El equipo humano analiza tu caso y recomienda solo lo que tiene sentido para ti. Sin comisiones, sin afiliados, sin intereses ocultos.",
        badge: "Criterio humano · Respaldado por IA",
      },
      {
        num: "03", title: "Automatizacion de procesos", subtitle: "Resultados desde el primer mes",
        problema: "Tu equipo pierde horas en tareas repetitivas: copiar datos, enviar emails de seguimiento, generar informes. Trabajo que no aporta valor.",
        solucion: "Automatizamos esas tareas sin tocar tu forma de trabajar de golpe. Cambios pequenos, resultados medibles desde el primer mes.",
        badge: "NOVA analiza · Nosotros implementamos",
      },
      {
        num: "04", title: "Formacion practica del equipo", subtitle: "Maximo 6 personas · A vuestro ritmo",
        problema: "Compras una herramienta de IA y nadie del equipo la usa. O la usan mal. La tecnologia sin formacion es dinero tirado.",
        solucion: "Tres sesiones practicas con herramientas reales aplicadas a tu sector. El equipo sale sabiendo usarlas, no solo conociendo su existencia.",
        badge: "Sin jerga · Sin teoria vacia",
      },
    ],
    casosLabel: "Casos reales",
    casosTitle: "Esto ya lo estamos haciendo.",
    casosSubtitle: "Automatizaciones reales que implementamos en PYMEs. Haz clic para ver como funciona cada una.",
    labelProblema: "El problema",
    labelSolucion: "La solucion",
    labelTransporte: "Transporte",
    labelGirar: "girar",
    labelVolver: "volver",
    novaLabel: "Agente IA",
    novaTitle: "NOVA, tu consultor de IA disponible 24/7.",
    novaBody: "NOVA es el agente de XpertAuth especializado en IA para PYMEs. Practica, directa y sin humo. Resuelve dudas sobre automatizacion, herramientas y procesos en tiempo real.",
    novaBtn: "Pregunta a NOVA",
    novaPreguntas: [
      "Que procesos de mi empresa se pueden automatizar facilmente?",
      "Cuanto cuesta implementar IA en una PYME pequena?",
      "Que herramientas de IA son utiles para gestionar clientes?",
    ],
    ctaTitle: "Da el primer paso.",
    ctaSubtitle: "La auditoria es gratuita. Sin compromiso. Sin presion.",
    ctaSocio: "Hazte socio",
    ctaContacto: "Contacta con nosotros",
  },
  ca: {
    heroTitle1: "La IA no es només",
    heroTitle2: "per a grans empreses.",
    heroSubtitle: "Automatitzem els teus processos, formem el teu equip i resolem els colls d'ampolla reals del teu negoci. Sense vendre tecnologia. Sense fum.",
    heroCtaSocio: "Fes-te soci",
    heroCtaContacto: "Contacta amb nosaltres",
    serviciosLabel: "El que fem",
    serviciosTitle: "No venem solucions. Resolem problemes.",
    serviciosSubtitle: "Abans de proposar res, entenem com treballes.",
    servicios: [
      {
        num: "01", title: "Auditoria inicial", subtitle: "Gratuita · Sense compromis",
        problema: "No saps per on comenar amb la IA. Veus que altres la usen pero no tens clar si et serveix a tu o que canviaries primer.",
        solucion: "Mapegem el teu flux de treball real, identifiquem els colls d'ampolla i et diem exactament on la IA t'estalviaria temps i diners.",
        badge: "Sense cost · Sense pressio",
      },
      {
        num: "02", title: "Consultoria d'implementacio", subtitle: "Triar be abans de gastar",
        problema: "El mercat esta ple d'eines de IA. No saps quina triar, quina s'integra amb el que ja tens o si realment val el que costa.",
        solucion: "L'equip huma analitza el teu cas i recomana nomes el que te sentit per a tu. Sense comissions, sense afiliats, sense interessos ocults.",
        badge: "Criteri huma · Recolzat per IA",
      },
      {
        num: "03", title: "Automatitzacio de processos", subtitle: "Resultats des del primer mes",
        problema: "El teu equip perd hores en tasques repetitives: copiar dades, enviar emails de seguiment, generar informes. Feina que no aporta valor.",
        solucion: "Automatitzem aquestes tasques sense canviar la teva forma de treballar de cop. Canvis petits, resultats mesurables des del primer mes.",
        badge: "NOVA analitza · Nosaltres implementem",
      },
      {
        num: "04", title: "Formacio practica de l'equip", subtitle: "Maxim 6 persones · Al vostre ritme",
        problema: "Compres una eina de IA i ningu de l'equip la fa servir. O la fan servir malament. La tecnologia sense formacio es diners tirats.",
        solucion: "Tres sessions practiques amb eines reals aplicades al teu sector. L'equip surt sabent usar-les, no nomes coneixent la seva existencia.",
        badge: "Sense argot · Sense teoria buida",
      },
    ],
    casosLabel: "Casos reals",
    casosTitle: "Aixo ja ho estem fent.",
    casosSubtitle: "Automatitzacions reals que implementem en PIMEs. Fes clic per veure com funciona cada una.",
    labelProblema: "El problema",
    labelSolucion: "La solucio",
    labelTransporte: "Transport",
    labelGirar: "girar",
    labelVolver: "tornar",
    novaLabel: "Agent IA",
    novaTitle: "NOVA, el teu consultor de IA disponible 24/7.",
    novaBody: "NOVA es l'agent de XpertAuth especialitzat en IA per a PYMEs. Practica, directa i sense fum. Resol dubtes sobre automatitzacio, eines i processos en temps real.",
    novaBtn: "Pregunta a NOVA",
    novaPreguntas: [
      "Quins processos de la meva empresa es poden automatitzar facilment?",
      "Quant costa implementar IA en una PIME petita?",
      "Quines eines de IA son utiles per gestionar clients?",
    ],
    ctaTitle: "Fes el primer pas.",
    ctaSubtitle: "L'auditoria es gratuita. Sense compromis. Sense pressio.",
    ctaSocio: "Fes-te soci",
    ctaContacto: "Contacta amb nosaltres",
  },
  en: {
    heroTitle1: "AI is not just for",
    heroTitle2: "big companies.",
    heroSubtitle: "We automate your processes, train your team and solve the real bottlenecks in your business. No technology sales pitch. No hype.",
    heroCtaSocio: "Become a member",
    heroCtaContacto: "Contact us",
    serviciosLabel: "What we do",
    serviciosTitle: "We don't sell solutions. We solve problems.",
    serviciosSubtitle: "Before proposing anything, we understand how you work.",
    servicios: [
      {
        num: "01", title: "Initial audit", subtitle: "Free · No commitment",
        problema: "You don't know where to start with AI. You see others using it but you're not sure if it works for you or what you'd change first.",
        solucion: "We map your real workflow, identify the bottlenecks and tell you exactly where AI would save you time and money.",
        badge: "No cost · No pressure",
      },
      {
        num: "02", title: "Implementation consulting", subtitle: "Choose well before spending",
        problema: "The market is full of AI tools. You don't know which to choose, which integrates with what you already have, or if it's worth the cost.",
        solucion: "Our human team analyses your case and recommends only what makes sense for you. No commissions, no affiliates, no hidden interests.",
        badge: "Human judgement · Backed by AI",
      },
      {
        num: "03", title: "Process automation", subtitle: "Results from the first month",
        problema: "Your team wastes hours on repetitive tasks: copying data, sending follow-up emails, generating reports. Work that adds no value.",
        solucion: "We automate those tasks without overhauling how you work overnight. Small changes, measurable results from the first month.",
        badge: "NOVA analyses · We implement",
      },
      {
        num: "04", title: "Practical team training", subtitle: "Max 6 people · At your own pace",
        problema: "You buy an AI tool and nobody on the team uses it. Or they use it badly. Technology without training is money wasted.",
        solucion: "Three practical sessions with real tools applied to your sector. The team leaves knowing how to use them, not just knowing they exist.",
        badge: "No jargon · No empty theory",
      },
    ],
    casosLabel: "Real cases",
    casosTitle: "We are already doing this.",
    casosSubtitle: "Real automations we implement in SMEs. Click to see how each one works.",
    labelProblema: "The problem",
    labelSolucion: "The solution",
    labelTransporte: "Transport",
    labelGirar: "flip",
    labelVolver: "back",
    novaLabel: "AI Agent",
    novaTitle: "NOVA, your AI consultant available 24/7.",
    novaBody: "NOVA is XpertAuth's agent specialised in AI for SMEs. Practical, direct, and no hype. Answers questions about automation, tools, and processes in real time.",
    novaBtn: "Ask NOVA",
    novaPreguntas: [
      "Which processes in my business can be easily automated?",
      "How much does it cost to implement AI in a small SME?",
      "What AI tools are useful for managing customers?",
    ],
    ctaTitle: "Take the first step.",
    ctaSubtitle: "The audit is free. No commitment. No pressure.",
    ctaSocio: "Become a member",
    ctaContacto: "Contact us",
  },
  fr: {
    heroTitle1: "L'IA n'est pas reservee aux",
    heroTitle2: "grandes entreprises.",
    heroSubtitle: "Nous automatisons vos processus, formons votre equipe et resolvons les vrais goulots d'etranglement de votre activite. Sans vendre de technologie. Sans enfumage.",
    heroCtaSocio: "Devenir membre",
    heroCtaContacto: "Nous contacter",
    serviciosLabel: "Ce que nous faisons",
    serviciosTitle: "Nous ne vendons pas de solutions. Nous resolvons des problemes.",
    serviciosSubtitle: "Avant de proposer quoi que ce soit, nous comprenons comment vous travaillez.",
    servicios: [
      {
        num: "01", title: "Audit initial", subtitle: "Gratuit · Sans engagement",
        problema: "Vous ne savez pas par ou commencer avec l'IA. Vous voyez que d'autres l'utilisent mais vous ne savez pas si cela vous convient.",
        solucion: "Nous cartographions votre flux de travail reel, identifions les goulots d'etranglement et vous disons exactement ou l'IA vous ferait gagner du temps.",
        badge: "Sans cout · Sans pression",
      },
      {
        num: "02", title: "Conseil en implementation", subtitle: "Bien choisir avant de depenser",
        problema: "Le marche regorge d'outils IA. Vous ne savez pas lequel choisir, lequel s'integre avec ce que vous avez deja ou s'il vaut vraiment son prix.",
        solucion: "Notre equipe humaine analyse votre cas et ne recommande que ce qui a du sens pour vous. Sans commissions, sans affilies, sans interets caches.",
        badge: "Jugement humain · Soutenu par IA",
      },
      {
        num: "03", title: "Automatisation des processus", subtitle: "Resultats des le premier mois",
        problema: "Votre equipe perd des heures sur des taches repetitives: copier des donnees, envoyer des emails de suivi, generer des rapports.",
        solucion: "Nous automatisons ces taches sans bouleverser votre facon de travailler. Petits changements, resultats mesurables des le premier mois.",
        badge: "NOVA analyse · Nous implementons",
      },
      {
        num: "04", title: "Formation pratique de l'equipe", subtitle: "Max 6 personnes · A votre rythme",
        problema: "Vous achetez un outil IA et personne dans l'equipe ne l'utilise. Ou ils l'utilisent mal. La technologie sans formation est de l'argent gaspille.",
        solucion: "Trois sessions pratiques avec de vrais outils appliques a votre secteur. L'equipe repart en sachant les utiliser, pas seulement en connaissant leur existence.",
        badge: "Sans jargon · Sans theorie creuse",
      },
    ],
    casosLabel: "Cas reels",
    casosTitle: "Nous le faisons deja.",
    casosSubtitle: "Automatisations reelles que nous mettons en oeuvre dans les PME. Cliquez pour voir comment chacune fonctionne.",
    labelProblema: "Le probleme",
    labelSolucion: "La solution",
    labelTransporte: "Transport",
    labelGirar: "retourner",
    labelVolver: "retour",
    novaLabel: "Agent IA",
    novaTitle: "NOVA, votre consultant IA disponible 24/7.",
    novaBody: "NOVA est l'agent XpertAuth specialise dans l'IA pour les PME. Pratique, direct et sans enfumage. Il repond aux questions sur l'automatisation, les outils et les processus en temps reel.",
    novaBtn: "Demandez a NOVA",
    novaPreguntas: [
      "Quels processus de mon entreprise peuvent etre facilement automatises ?",
      "Combien coute la mise en place de l'IA dans une petite PME ?",
      "Quels outils IA sont utiles pour gerer les clients ?",
    ],
    ctaTitle: "Faites le premier pas.",
    ctaSubtitle: "L'audit est gratuit. Sans engagement. Sans pression.",
    ctaSocio: "Devenir membre",
    ctaContacto: "Nous contacter",
  },
};

// ─── Pagina principal ─────────────────────────────────────────────────────────
export default function IaPymes() {
  const [location] = useLocation();
  const locale = location.split("/")[1] || "es";
  const t = texts[locale] || texts.es;
  const { abrirAgente } = useAgent();
  const [contactOpen, setContactOpen] = useState(false);
  const rutaSocios = "/" + locale + "/socios";

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <style>{`
        @keyframes flowPulse {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes flowDot {
          0%   { left: 0px;  opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { left: 22px; opacity: 0; }
        }
      `}</style>
      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-[#0A0E1A]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            <span style={gradientStyle}>{t.heroTitle1}</span>
            <br />
            <span style={gradientStyle}>{t.heroTitle2}</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = rutaSocios}
              className="px-7 py-3.5 bg-[#1B4FD8] hover:bg-[#1B4FD8]/90 text-white font-semibold rounded-lg transition-all duration-200"
            >
              {t.heroCtaSocio}
            </button>
            <button
              onClick={() => setContactOpen(true)}
              className="px-7 py-3.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white font-semibold rounded-lg transition-all duration-200"
            >
              {t.heroCtaContacto}
            </button>
          </div>
        </div>
      </section>

      {/* SERVICIOS — Problema/Solucion */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0A0E1A] border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#4D9FEC] text-xs font-semibold tracking-widest uppercase">{t.serviciosLabel}</span>
            <h2 className="font-bold text-3xl sm:text-4xl mt-4" style={gradientStyle}>
              {t.serviciosTitle}
            </h2>
            <p className="mt-4 text-white/60 max-w-xl mx-auto">{t.serviciosSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {t.servicios.map((srv, i) => (
              <RevealDiv key={i} delay={i * 80}>
                <ServiceCard {...srv} index={i} labelProblema={t.labelProblema} labelSolucion={t.labelSolucion} />
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* CASOS DE USO — Acordeon */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0F1628] border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#4D9FEC] text-xs font-semibold tracking-widest uppercase">{t.casosLabel}</span>
            <h2 className="font-bold text-3xl sm:text-4xl mt-4" style={gradientStyle}>
              {t.casosTitle}
            </h2>
            <p className="mt-4 text-white/60 max-w-xl mx-auto">{t.casosSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(casosUsoByLocale[locale] || casosUsoByLocale.es).map((caso, i) => (
              <RevealDiv key={i} delay={i * 60}>
                <CasoFlipCard
                  caso={caso}
                  labelTransporte={t.labelTransporte}
                  labelGirar={t.labelGirar}
                  labelVolver={t.labelVolver}
                />
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* NOVA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0A0E1A] border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#4D9FEC] text-xs font-semibold tracking-widest uppercase">{t.novaLabel}</span>
            <h2 className="font-bold text-3xl sm:text-4xl mt-4" style={gradientStyle}>
              {t.novaTitle}
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto leading-relaxed">
              {t.novaBody}
            </p>
          </div>
          <RevealDiv>
            <div className="bg-[#0F1628] border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#4D9FEC]/20 flex items-center justify-center">
                <span className="text-[#4D9FEC] text-xs font-bold">N</span>
              </div>
              <span className="text-white font-semibold text-sm">NOVA · XpertAuth</span>
              <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Activo</span>
            </div>
            <div className="space-y-3">
              {t.novaPreguntas.map((q, i) => (
                <button
                  key={i}
                  onClick={() => abrirAgente("NOVA")}
                  className="w-full text-left px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/60 text-sm hover:border-[#4D9FEC]/30 hover:text-white/80 transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="mt-4 text-white/30 text-xs text-center">Ejemplos de consultas · Haz clic para preguntar</p>
          </div>
          </RevealDiv>
          <div className="text-center">
            <button
              onClick={() => abrirAgente("NOVA")}
              className="px-7 py-3.5 bg-[#4D9FEC] hover:bg-[#4D9FEC]/90 text-white font-semibold rounded-lg transition-all duration-200"
            >
              {t.novaBtn}
            </button>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#070A12] border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-bold text-3xl sm:text-4xl mb-5" style={gradientStyle}>
            {t.ctaTitle}
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">{t.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = rutaSocios}
              className="px-7 py-3.5 bg-[#1B4FD8] hover:bg-[#1B4FD8]/90 text-white font-semibold rounded-lg transition-all duration-200"
            >
              {t.ctaSocio}
            </button>
            <button
              onClick={() => setContactOpen(true)}
              className="px-7 py-3.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white font-semibold rounded-lg transition-all duration-200"
            >
              {t.ctaContacto}
            </button>
            <a
              href="https://calendar.app.google/q54rranYyoyCfcu77"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 border border-[#4D9FEC]/40 text-[#4D9FEC] font-semibold rounded-lg transition-all duration-200 hover:bg-[#4D9FEC]/10 hover:border-[#4D9FEC]/60 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Reserva tu cita
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
