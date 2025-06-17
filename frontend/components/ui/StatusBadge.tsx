import React from 'react';
import { Chip, ChipProps } from "@nextui-org/react";
import { getStatusColor, getStatusLabel, StatusColorType, STATUS_NEW, INFO_500, SUCCESS_500, WARNING_500, DANGER_500 } from '@/lib/utils/statusColors';

export interface StatusBadgeProps {
  /**
   * De status kleur code uit de database
   * Gebruik bij voorkeur de constanten: STATUS_NEW, INFO_500, WARNING_500, SUCCESS_500, DANGER_500
   */
  statusColor: StatusColorType;
  
  /**
   * Optioneel aangepast label, anders wordt het standaard label gebruikt
   */
  label?: string;
  
  /**
   * Variant van de chip
   * @default "flat"
   */
  variant?: ChipProps['variant'];
  
  /**
   * Grootte van de chip
   * @default "sm"
   */
  size?: ChipProps['size'];
  
  /**
   * Extra CSS klassen
   */
  className?: string;
  
  /**
   * Of de status een radius moet hebben
   * @default "full"
   */
  radius?: ChipProps['radius'];
  
  /**
   * Extra props voor de Chip component
   */
  chipProps?: Omit<ChipProps, 'children' | 'color' | 'variant' | 'size' | 'className' | 'radius'>;
}

/**
 * StatusBadge component voor het weergeven van statussen op basis van semantische kleurnamen
 * 
 * @example
 * <StatusBadge statusColor={STATUS_NEW} />
 * <StatusBadge statusColor={INFO_500} label="In Behandeling" />
 * <StatusBadge statusColor={SUCCESS_500} variant="solid" />
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  statusColor,
  label,
  variant = "flat",
  size = "sm",
  className = "",
  radius = "full",
  chipProps
}) => {
  // Bepaal de juiste kleur op basis van de statusColor
  const color = getStatusColor(statusColor);
  
  // Gebruik het aangepaste label of het standaard label op basis van de statusColor
  const displayLabel = label || getStatusLabel(statusColor);
  
  return (
    <Chip
      color={color}
      variant={variant}
      size={size}
      radius={radius}
      className={className}
      {...chipProps}
    >
      {displayLabel}
    </Chip>
  );
};

export default StatusBadge; 