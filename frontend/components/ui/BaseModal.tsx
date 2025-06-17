import React, { useEffect, useRef } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';

export interface BaseModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  
  /**
   * Function to call when modal should close
   */
  onClose: () => void;
  
  /**
   * Modal title
   */
  title?: string;
  
  /**
   * Modal size
   */
  size?: ModalSize;
  
  /**
   * Whether modal can be closed by clicking backdrop or pressing escape
   */
  isDismissable?: boolean;
  
  /**
   * Whether to show close button in header
   */
  hideCloseButton?: boolean;
  
  /**
   * Modal content
   */
  children?: React.ReactNode;
  
  /**
   * Footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Modal backdrop type
   */
  backdrop?: 'transparent' | 'opaque' | 'blur';
  
  /**
   * Placement of modal
   */
  placement?: 'auto' | 'top' | 'center' | 'bottom';
  
  /**
   * Scroll behavior when content overflows
   */
  scrollBehavior?: 'inside' | 'outside';
}

/**
 * BaseModal - Core modal functionality component
 * 
 * Provides the foundation for all modals in the application with:
 * - Proper focus management
 * - Keyboard navigation (ESC to close)
 * - Backdrop click handling
 * - Responsive sizing
 * - Accessibility features
 * 
 * @example
 * ```tsx
 * <BaseModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="My Modal"
 *   size="lg"
 * >
 *   <p>Modal content here</p>
 * </BaseModal>
 * ```
 */
export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  isDismissable = true,
  hideCloseButton = false,
  children,
  footer,
  className = '',
  backdrop = 'opaque',
  placement = 'center',
  scrollBehavior = 'inside',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the modal when it opens
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      backdrop={backdrop}
      placement={placement}
      scrollBehavior={scrollBehavior}
      isDismissable={isDismissable}
      className={className}
      classNames={{
        base: "bg-background",
        header: "border-b border-divider",
        body: "py-6",
        footer: "border-t border-divider"
      }}
    >
      <ModalContent>
        {title && (
          <ModalHeader className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {title}
            </h2>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-default-100 transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5 text-foreground-500" />
              </button>
            )}
          </ModalHeader>
        )}
        
        <ModalBody>
          {children}
        </ModalBody>
        
        {footer && (
          <ModalFooter className="justify-end gap-2">
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BaseModal;