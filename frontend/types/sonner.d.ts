declare module 'sonner' {
  interface ToasterProps {
    position?: 
      | 'top-left'
      | 'top-center' 
      | 'top-right'
      | 'bottom-left'
      | 'bottom-center'
      | 'bottom-right';
    richColors?: boolean;
    expand?: boolean;
    duration?: number;
    visibleToasts?: number;
    closeButton?: boolean;
    toastOptions?: {
      className?: string;
      style?: React.CSSProperties;
      cancelButtonStyle?: React.CSSProperties;
      actionButtonStyle?: React.CSSProperties;
    };
    className?: string;
    style?: React.CSSProperties;
    offset?: number | string;
    dir?: 'ltr' | 'rtl' | 'auto';
    theme?: 'light' | 'dark' | 'system';
    gap?: number;
    loadingIcon?: React.ReactNode;
    icons?: {
      success?: React.ReactNode;
      info?: React.ReactNode;
      warning?: React.ReactNode;
      error?: React.ReactNode;
      loading?: React.ReactNode;
    };
  }

  export const Toaster: React.FC<ToasterProps>;

  interface ToastOptions {
    id?: string | number;
    duration?: number;
    position?: ToasterProps['position'];
    dismissible?: boolean;
    icon?: React.ReactNode;
    action?: {
      label: string;
      onClick: () => void;
    };
    cancel?: {
      label: string;
      onClick?: () => void;
    };
    description?: string;
    className?: string;
    style?: React.CSSProperties;
    cancelButtonStyle?: React.CSSProperties;
    actionButtonStyle?: React.CSSProperties;
  }

  export const toast: {
    (message: string, options?: ToastOptions): string | number;
    success(message: string, options?: ToastOptions): string | number;
    error(message: string, options?: ToastOptions): string | number;
    warning(message: string, options?: ToastOptions): string | number;
    info(message: string, options?: ToastOptions): string | number;
    promise<T>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      } & ToastOptions
    ): Promise<T>;
    custom(jsx: React.ReactNode, options?: ToastOptions): string | number;
    dismiss(id?: string | number): void;
  };
}