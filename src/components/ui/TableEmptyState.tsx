import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { FiInbox } from 'react-icons/fi';

export interface TableEmptyStateProps {
  icon?: IconType;
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  colSpan?: number;
  className?: string;
}

export function TableEmptyState({
  icon: Icon = FiInbox,
  title = 'No records found',
  description,
  action,
  colSpan,
  className = '',
}: TableEmptyStateProps) {
  const content = (
    <div className={`org-empty-state ${className}`.trim()}>
      <Icon className="org-empty-icon" aria-hidden="true" />
      {title && <p className="org-empty-title">{title}</p>}
      {description && <p className="org-empty-desc">{description}</p>}
      {action && <div className="org-empty-action">{action}</div>}
    </div>
  );

  if (typeof colSpan === 'number') {
    return (
      <tr>
        <td colSpan={colSpan} className="org-table-empty-cell">
          {content}
        </td>
      </tr>
    );
  }

  return content;
}

export default TableEmptyState;
