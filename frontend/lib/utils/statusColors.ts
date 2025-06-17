/**
 * Utility functies voor het mappen van status kleuren naar NextUI kleuren en CSS klassen
 * 
 * ChargeCars gebruikt een consistent kleurensysteem voor statussen in de hele applicatie.
 * Deze utility zorgt ervoor dat de kleuren in de frontend overeenkomen met de kleuren in de backend.
 * 
 * Backend kleurnamen:
 * - status-new: Nieuwe items (blauw)
 * - info-500: Items in behandeling (blauw)
 * - warning-500: Items die wachten op actie (amber)
 * - success-500: Voltooide items (groen)
 * - danger-500: Geannuleerde of mislukte items (rood)
 */

// Constanten voor de semantische kleurnamen
export const STATUS_NEW = 'status-new';
export const INFO_500 = 'info-500';
export const WARNING_500 = 'warning-500';
export const SUCCESS_500 = 'success-500';
export const DANGER_500 = 'danger-500';

// Type voor de status kleuren zoals ze in de database staan
export type StatusColorType = typeof STATUS_NEW | typeof INFO_500 | typeof WARNING_500 | typeof SUCCESS_500 | typeof DANGER_500 | string;

// Type voor de NextUI color varianten
export type NextUIColorType = "default" | "primary" | "secondary" | "success" | "warning" | "danger";

// Constanten voor de HEX kleurcodes
export const COLOR_HEX = {
  [STATUS_NEW]: '#2563EB', // primary-500
  [INFO_500]: '#0EA5E9',   // info-500
  [WARNING_500]: '#F59E0B', // warning-500
  [SUCCESS_500]: '#10B981', // success-500
  [DANGER_500]: '#EF4444',  // danger-500
  default: '#6B7280',       // gray-500
} as const;

// Constanten voor de NextUI kleur varianten
export const COLOR_NEXTUI = {
  [STATUS_NEW]: 'primary' as NextUIColorType,
  [INFO_500]: 'primary' as NextUIColorType,
  [WARNING_500]: 'warning' as NextUIColorType,
  [SUCCESS_500]: 'success' as NextUIColorType,
  [DANGER_500]: 'danger' as NextUIColorType,
  default: 'default' as NextUIColorType,
} as const;

// Constanten voor de Tailwind CSS klassen
export const COLOR_CLASS = {
  [STATUS_NEW]: 'bg-blue-600 text-white',
  [INFO_500]: 'bg-sky-500 text-white',
  [WARNING_500]: 'bg-amber-500 text-white',
  [SUCCESS_500]: 'bg-emerald-500 text-white',
  [DANGER_500]: 'bg-red-500 text-white',
  default: 'bg-gray-500 text-white',
} as const;

// Constanten voor de Nederlandse labels
export const STATUS_LABEL = {
  [STATUS_NEW]: 'Nieuw',
  [INFO_500]: 'In behandeling',
  [WARNING_500]: 'Wacht op klant',
  [SUCCESS_500]: 'Afgerond',
  [DANGER_500]: 'Geannuleerd',
  default: 'Onbekend',
} as const;

/**
 * Mapt een status kleur naar een NextUI color prop
 * @param statusColor De status kleur code uit de database
 * @returns NextUI color variant
 */
export const getStatusColor = (statusColor: StatusColorType): NextUIColorType => {
  // Direct mapping van database kleurnamen naar NextUI kleuren
  if (statusColor in COLOR_NEXTUI) {
    return COLOR_NEXTUI[statusColor as keyof typeof COLOR_NEXTUI];
  }
  
  // Legacy mapping voor backwards compatibility
  return mapLegacyStatusToColor(statusColor);
};

// Arrays voor de legacy mapping
const PRIMARY_STATUSES = [
  'in_progress', 'open', 'active', 'in_uitvoering', 'bezig', 'actief',
  'In uitvoering', 'Actief', 'Open', 'Nieuw'
];

const WARNING_STATUSES = [
  'draft', 'ready', 'pending', 'waiting', 'on_hold', 'paused', 'concept',
  'klaar', 'wachtend', 'in_behandeling', 'In behandeling', 'Concept',
  'Draft', 'Pending', 'quote_draft', 'offerte_concept', 'Wachten op klant'
];

const SECONDARY_STATUSES = [
  'quote_sent', 'sent', 'verstuurd', 'Offerte Concept', 'partner_akkoord',
  'Partner Akkoord', 'waiting_customer', 'awaiting_approval', 'submitted',
  'Ingepland', 'Gepland'
];

const SUCCESS_STATUSES = [
  'completed', 'approved', 'delivered', 'installed', 'finished', 'done',
  'voltooid', 'goedgekeurd', 'geleverd', 'geïnstalleerd', 'klant_akkoord',
  'customer_approved', 'Voltooid', 'Klant Akkoord', 'Goedgekeurd',
  'Geleverd', 'Completed', 'Approved', 'Afgerond'
];

const DANGER_STATUSES = [
  'cancelled', 'rejected', 'failed', 'expired', 'error', 'geannuleerd',
  'afgewezen', 'gefaald', 'verlopen', 'Geannuleerd', 'Afgewezen',
  'Cancelled', 'Rejected', 'Failed'
];

/**
 * Legacy mapping voor bestaande status waarden
 * @param statusKey De oude status waarde
 * @returns NextUI color variant
 */
export const mapLegacyStatusToColor = (statusKey: string): NextUIColorType => {
  // Gebruik de vooraf gedefinieerde arrays voor snellere lookup
  if (PRIMARY_STATUSES.includes(statusKey)) return 'primary';
  if (WARNING_STATUSES.includes(statusKey)) return 'warning';
  if (SECONDARY_STATUSES.includes(statusKey)) return 'secondary';
  if (SUCCESS_STATUSES.includes(statusKey)) return 'success';
  if (DANGER_STATUSES.includes(statusKey)) return 'danger';
  
  // Default fallback
  return 'default';
};

/**
 * Mapt een status kleur naar een CSS kleur voor custom styling
 * @param statusColor De status kleur code uit de database
 * @returns HEX kleurcode
 */
export const getStatusColorHex = (statusColor: StatusColorType): string => {
  return COLOR_HEX[statusColor as keyof typeof COLOR_HEX] || COLOR_HEX.default;
};

/**
 * Mapt een status kleur naar een CSS klasse voor Tailwind styling
 * @param statusColor De status kleur code uit de database
 * @returns Tailwind CSS klasse
 */
export const getStatusColorClass = (statusColor: StatusColorType): string => {
  return COLOR_CLASS[statusColor as keyof typeof COLOR_CLASS] || COLOR_CLASS.default;
};

/**
 * Mapt een status kleur naar een Nederlandse label
 * @param statusColor De status kleur code uit de database
 * @returns Nederlands label voor de status
 */
export const getStatusLabel = (statusColor: StatusColorType): string => {
  return STATUS_LABEL[statusColor as keyof typeof STATUS_LABEL] || STATUS_LABEL.default;
}; 