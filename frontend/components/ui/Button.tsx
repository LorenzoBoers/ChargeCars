import React from 'react';
import { Button as NextUIButton, ButtonProps as NextUIButtonProps } from "@nextui-org/react";
import { BUTTON_STYLES, ButtonActionConfig } from '@/types/ui';

/**
 * Props voor de Button component
 */
export interface ButtonProps extends Omit<NextUIButtonProps, 'type'> {
  /**
   * Het type actie van de button, bepaalt de styling
   */
  actionType?: keyof typeof BUTTON_STYLES;
  
  /**
   * De HTML button type
   */
  htmlType?: 'button' | 'submit' | 'reset';
  
  /**
   * Icon aan de linkerkant van de button
   */
  startIcon?: React.ReactNode;
  
  /**
   * Icon aan de rechterkant van de button
   */
  endIcon?: React.ReactNode;
  
  /**
   * Tekst van de button
   */
  children?: React.ReactNode;
}

/**
 * Gestandaardiseerde Button component die de styling uit types/ui.ts gebruikt
 * 
 * @example
 * <Button actionType="create">Nieuwe Order</Button>
 * <Button actionType="delete">Verwijderen</Button>
 * <Button actionType="view" startIcon={<EyeIcon />}>Bekijken</Button>
 */
export const Button: React.FC<ButtonProps> = ({
  actionType = 'create',
  htmlType = 'button',
  startIcon,
  endIcon,
  children,
  ...props
}) => {
  // Haal de styling voor dit type actie op
  const buttonStyle = BUTTON_STYLES[actionType as keyof typeof BUTTON_STYLES];
  
  return (
    <NextUIButton
      type={htmlType as any}
      variant={buttonStyle.variant as any}
      color={buttonStyle.color as any}
      size={buttonStyle.size as any}
      className={buttonStyle.className}
      startContent={startIcon}
      endContent={endIcon}
      {...props}
    >
      {children}
    </NextUIButton>
  );
};

export default Button; 