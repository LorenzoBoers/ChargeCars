/**
 * @fileoverview UI Types
 * 
 * Deze module bevat TypeScript types voor UI componenten en styling.
 * 
 * @author ChargeCars Development Team
 * @version 1.0.0
 */

import { ButtonVariant, ButtonSize } from './index';

/**
 * Button action types voor verschillende soorten acties in de UI
 */
export type ButtonActionType = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

/**
 * Button action configuratie voor consistente styling op basis van actie type
 */
export interface ButtonActionConfig {
  variant: 'light' | 'solid' | 'bordered' | 'flat' | 'faded' | 'shadow' | 'ghost';
  color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size: ButtonSize;
  className?: string;
}

/**
 * Button styling mapping voor verschillende acties
 */
export const BUTTON_ACTION_STYLES: Record<ButtonActionType, ButtonActionConfig> = {
  primary: {
    variant: 'solid',
    color: 'primary',
    size: 'md' as ButtonSize
  },
  secondary: {
    variant: 'bordered',
    color: 'default',
    size: 'md' as ButtonSize
  },
  success: {
    variant: 'solid',
    color: 'success',
    size: 'md' as ButtonSize
  },
  danger: {
    variant: 'solid',
    color: 'danger',
    size: 'md' as ButtonSize
  },
  warning: {
    variant: 'solid',
    color: 'warning',
    size: 'md' as ButtonSize
  },
  info: {
    variant: 'light',
    color: 'primary',
    size: 'sm' as ButtonSize
  }
};

/**
 * Specifieke button styling voor veelvoorkomende acties
 */
export const BUTTON_STYLES = {
  // Primaire acties
  create: {
    ...BUTTON_ACTION_STYLES.primary,
    size: 'md' as ButtonSize
  },
  save: {
    ...BUTTON_ACTION_STYLES.primary,
    size: 'md' as ButtonSize
  },
  submit: {
    ...BUTTON_ACTION_STYLES.primary,
    size: 'md' as ButtonSize
  },
  
  // Secundaire acties
  cancel: {
    ...BUTTON_ACTION_STYLES.secondary,
    size: 'md' as ButtonSize
  },
  back: {
    ...BUTTON_ACTION_STYLES.secondary,
    size: 'md' as ButtonSize
  },
  
  // Informatie acties
  view: {
    ...BUTTON_ACTION_STYLES.info,
    size: 'sm' as ButtonSize,
    variant: 'light'
  },
  filter: {
    ...BUTTON_ACTION_STYLES.info,
    size: 'sm' as ButtonSize
  },
  export: {
    ...BUTTON_ACTION_STYLES.info,
    size: 'sm' as ButtonSize
  },
  refresh: {
    ...BUTTON_ACTION_STYLES.info,
    size: 'sm' as ButtonSize
  },
  
  // Data manipulatie
  edit: {
    ...BUTTON_ACTION_STYLES.info,
    size: 'sm' as ButtonSize,
    variant: 'light'
  },
  duplicate: {
    ...BUTTON_ACTION_STYLES.info,
    size: 'sm' as ButtonSize,
    variant: 'light'
  },
  delete: {
    ...BUTTON_ACTION_STYLES.danger,
    size: 'sm' as ButtonSize,
    variant: 'light'
  },
  
  // Kleine utility acties
  iconOnly: {
    variant: 'light',
    color: 'default',
    size: 'sm' as ButtonSize,
    className: 'min-w-6 w-6 h-6'
  }
};

/**
 * Paginatie configuratie
 */
export interface PaginationConfig {
  defaultPageSize: number;
  pageSizeOptions: number[];
  maxPagesToShow: number;
}

/**
 * Standaard paginatie configuratie
 */
export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50, 100],
  maxPagesToShow: 5
}; 