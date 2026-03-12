// styles/colors.ts
export const colors = {
  // Cores principais
  primary: '#1e3a5a',
  accent: '#d32f2f',
  bg: '#f4f7f9',
  text: '#2c3e50',
  white: '#ffffff',
  
  // Estados
  success: '#2ecc71',
  warning: '#f39c12',
  danger: '#d32f2f',
  info: '#3498db',
  
  // Tons de cinza
  gray: '#64748b',
  lightGray: '#e2e8f0',
  lighterGray: '#f8fafc',
  darkGray: '#334155',
  
  // Bordas
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderDanger: '#fecdd3',
  
  // Backgrounds
  bgLight: '#fff5f5',
  bgSuccess: '#f0fdf4',
  bgWarning: '#fef3c7',
  bgInfo: '#dbeafe',
} as const;

export type Colors = typeof colors;

// Status mapping
export const statusColors = {
  OK: colors.success,
  AVARIA: colors.danger,
  VENCIDO: colors.warning,
  SOBRA: colors.warning,
  FALTA: colors.danger,
  AGUARDANDO: colors.gray,
} as const;

export type StatusColors = typeof statusColors;