import { DOMAttributes } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'vscode-badge': DOMAttributes<HTMLElement> & {
        variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'note' | 'tip' | 'caution';
        children?: React.ReactNode;
      };
      'vscode-button': DOMAttributes<HTMLElement> & {
        variant?: 'primary' | 'secondary' | 'icon';
        disabled?: boolean;
        children?: React.ReactNode;
      };
      'vscode-textfield': DOMAttributes<HTMLElement> & {
        value?: string;
        placeholder?: string;
        disabled?: boolean;
        type?: string;
        maxlength?: number;
        onInput?: (event: Event) => void;
      };
      'vscode-single-select': DOMAttributes<HTMLElement> & {
        value?: string;
        disabled?: boolean;
        onChange?: (event: Event) => void;
        children?: React.ReactNode;
      };
      'vscode-option': DOMAttributes<HTMLElement> & {
        key?: string | number;
        value?: string;
        selected?: boolean;
        disabled?: boolean;
        children?: React.ReactNode;
      };
      'vscode-tabs': DOMAttributes<HTMLElement> & {
        selectedIndex?: number;
        children?: React.ReactNode;
      };
      'vscode-tab-header': DOMAttributes<HTMLElement> & {
        slot?: string;
        children?: React.ReactNode;
      };
      'vscode-tab-panel': DOMAttributes<HTMLElement> & {
        children?: React.ReactNode;
      };
      'vscode-collapsible': DOMAttributes<HTMLElement> & {
        title?: string;
        open?: boolean;
        children?: React.ReactNode;
      };
      'vscode-divider': DOMAttributes<HTMLElement> & {
        role?: string;
      };
      'vscode-form-container': DOMAttributes<HTMLElement> & {
        children?: React.ReactNode;
      };
      'vscode-form-group': DOMAttributes<HTMLElement> & {
        children?: React.ReactNode;
      };
      'vscode-label': DOMAttributes<HTMLElement> & {
        children?: React.ReactNode;
      };
      'vscode-table': DOMAttributes<HTMLElement> & {
        children?: React.ReactNode;
      };
      'vscode-table-header': DOMAttributes<HTMLElement> & {
        children?: React.ReactNode;
      };
      'vscode-table-body': DOMAttributes<HTMLElement> & {
        children?: React.ReactNode;
      };
      'vscode-table-row': DOMAttributes<HTMLElement> & {
        children?: React.ReactNode;
      };
      'vscode-table-cell': DOMAttributes<HTMLElement> & {
        children?: React.ReactNode;
      };
      'vscode-table-header-cell': DOMAttributes<HTMLElement> & {
        children?: React.ReactNode;
      };
    }
  }
}

export {};
