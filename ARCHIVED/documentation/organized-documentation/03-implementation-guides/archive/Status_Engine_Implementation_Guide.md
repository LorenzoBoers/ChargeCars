# Status Engine Implementation Guide - ChargeCars V2

## Overview

This guide provides step-by-step implementation instructions for the Status Engine, including Xano functions, frontend components, and integration patterns.

## Phase 1: Core Xano Functions

### 1. Universal Status Change Function

**Function Name**: `change_entity_status`
**Method**: POST
**Endpoint**: `/status/change`

#### Input Parameters
```javascript
{
  "entity_type": "text", // required
  "entity_id": "number", // required
  "to_status": "text", // required
  "transition_reason": "text", // optional
  "business_context": "object", // optional
  "metadata": "object" // optional
}
```

#### Function Implementation
```javascript
// Get current status
const currentStatusQuery = xano.database.query(`
  SELECT current_status, workflow_id, last_transition_id 
  FROM entity_current_status 
  WHERE entity_type = @entity_type AND entity_id = @entity_id
`, {
  entity_type: input.entity_type,
  entity_id: input.entity_id
});

const currentStatus = currentStatusQuery.length > 0 ? currentStatusQuery[0] : null;

// Validate transition
if (currentStatus) {
  const workflowSteps = xano.database.query(`
    SELECT allowed_transitions, sla_hours, requires_approval 
    FROM status_workflow_steps 
    WHERE workflow_id = @workflow_id AND status_name = @current_status
  `, {
    workflow_id: currentStatus.workflow_id,
    current_status: currentStatus.current_status
  });

  if (workflowSteps.length > 0) {
    const allowedTransitions = JSON.parse(workflowSteps[0].allowed_transitions || '[]');
    if (!allowedTransitions.includes(input.to_status)) {
      throw new Error(`Invalid transition from ${currentStatus.current_status} to ${input.to_status}`);
    }
  }
}

// Create transition record
const transitionId = xano.database.insert('status_transitions', {
  entity_type: input.entity_type,
  entity_id: input.entity_id,
  from_status: currentStatus?.current_status || null,
  to_status: input.to_status,
  transition_reason: input.transition_reason,
  business_context: input.business_context,
  triggered_by_user_id: request.user.id,
  metadata: input.metadata,
  is_milestone: true // Determine based on workflow configuration
});

// Calculate SLA deadline
const newWorkflowStep = xano.database.query(`
  SELECT sla_hours FROM status_workflow_steps 
  WHERE workflow_id = @workflow_id AND status_name = @status_name
`, {
  workflow_id: currentStatus?.workflow_id,
  status_name: input.to_status
});

const slaDeadline = newWorkflowStep.length > 0 && newWorkflowStep[0].sla_hours 
  ? new Date(Date.now() + (newWorkflowStep[0].sla_hours * 60 * 60 * 1000))
  : null;

// Update current status cache
if (currentStatus) {
  xano.database.update('entity_current_status', currentStatus.id, {
    current_status: input.to_status,
    status_since: new Date(),
    sla_deadline: slaDeadline,
    is_overdue: false,
    last_transition_id: transitionId
  });
} else {
  xano.database.insert('entity_current_status', {
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    current_status: input.to_status,
    status_since: new Date(),
    sla_deadline: slaDeadline,
    is_overdue: false,
    last_transition_id: transitionId
  });
}

// Log to audit trail
xano.database.insert('audit_logs', {
  table_name: 'status_transitions',
  record_id: transitionId,
  action: 'CREATE',
  changed_by_user_id: request.user.id,
  changes: {
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    status_change: `${currentStatus?.current_status || 'null'} -> ${input.to_status}`
  }
});

return {
  success: true,
  transition_id: transitionId,
  from_status: currentStatus?.current_status || null,
  to_status: input.to_status,
  sla_deadline: slaDeadline
};
```

### 2. Status History Function

**Function Name**: `get_status_history`
**Method**: GET
**Endpoint**: `/status/history/{entity_type}/{entity_id}`

#### Function Implementation
```javascript
const history = xano.database.query(`
  SELECT 
    st.*,
    ua.name as triggered_by_name,
    sws.status_label,
    sws.status_color
  FROM status_transitions st
  LEFT JOIN user_accounts ua ON st.triggered_by_user_id = ua.id
  LEFT JOIN status_workflow_steps sws ON st.to_status = sws.status_name
  WHERE st.entity_type = @entity_type AND st.entity_id = @entity_id
  ORDER BY st.created_at DESC
  LIMIT @limit OFFSET @offset
`, {
  entity_type: request.params.entity_type,
  entity_id: request.params.entity_id,
  limit: request.query.limit || 50,
  offset: request.query.offset || 0
});

const currentStatus = xano.database.query(`
  SELECT * FROM entity_current_status 
  WHERE entity_type = @entity_type AND entity_id = @entity_id
`, {
  entity_type: request.params.entity_type,
  entity_id: request.params.entity_id
});

return {
  entity_type: request.params.entity_type,
  entity_id: parseInt(request.params.entity_id),
  current_status: currentStatus[0] || null,
  history: history
};
```

### 3. Overdue Detection Function

**Function Name**: `update_overdue_status`
**Method**: POST (Background Task)
**Endpoint**: `/status/update-overdue`

#### Function Implementation
```javascript
const overdueItems = xano.database.query(`
  UPDATE entity_current_status 
  SET is_overdue = true 
  WHERE sla_deadline < NOW() AND is_overdue = false
  RETURNING *
`);

// Send notifications for newly overdue items
overdueItems.forEach(item => {
  xano.database.insert('user_notifications', {
    user_id: null, // Will be determined by business rules
    notification_type: 'sla_overdue',
    title: `${item.entity_type} ${item.entity_id} is overdue`,
    message: `Status: ${item.current_status}. Overdue since: ${item.sla_deadline}`,
    metadata: {
      entity_type: item.entity_type,
      entity_id: item.entity_id,
      current_status: item.current_status
    }
  });
});

return {
  updated_count: overdueItems.length,
  overdue_items: overdueItems
};
```

## Phase 2: Frontend Components

### 1. Status Badge Component

```tsx
// components/StatusBadge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: string;
  statusLabel: string;
  statusColor: string;
  isOverdue?: boolean;
  slaDeadline?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  statusLabel,
  statusColor,
  isOverdue,
  slaDeadline
}) => {
  const badgeClasses = `
    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
    ${isOverdue ? 'bg-red-100 text-red-800 border border-red-300' : ''}
  `;

  return (
    <div className="relative">
      <span 
        className={badgeClasses}
        style={!isOverdue ? { backgroundColor: statusColor + '20', color: statusColor, border: `1px solid ${statusColor}` } : {}}
      >
        {statusLabel}
        {isOverdue && (
          <svg className="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
      </span>
      
      {slaDeadline && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            SLA: {new Date(slaDeadline).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 2. Status Timeline Component

```tsx
// components/StatusTimeline.tsx
import React from 'react';

interface StatusTimelineProps {
  history: Array<{
    transition_id: string;
    from_status: string | null;
    to_status: string;
    created_at: string;
    transition_reason?: string;
    triggered_by_name?: string;
    status_label: string;
    status_color: string;
  }>;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ history }) => {
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, index) => (
          <li key={item.transition_id}>
            <div className="relative pb-8">
              {index !== history.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
              )}
              
              <div className="relative flex space-x-3">
                <div>
                  <span 
                    className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                    style={{ backgroundColor: item.status_color }}
                  >
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                </div>
                
                <div className="min-w-0 flex-1 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      {item.status_label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  {item.transition_reason && (
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{item.transition_reason}</p>
                    </div>
                  )}
                  
                  {item.triggered_by_name && (
                    <div className="mt-1 text-xs text-gray-500">
                      by {item.triggered_by_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### 3. Status Change Modal

```tsx
// components/StatusChangeModal.tsx
import React, { useState } from 'react';
import { useStatusEngine } from '../hooks/useStatusEngine';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  entityId: number;
  currentStatus: string;
  allowedTransitions: string[];
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  currentStatus,
  allowedTransitions
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason] = useState('');
  const { changeStatus, isLoading } = useStatusEngine();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await changeStatus({
        entity_type: entityType,
        entity_id: entityId,
        to_status: selectedStatus,
        transition_reason: reason
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Change Status
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status: {currentStatus}
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select new status...</option>
                  {allowedTransitions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Reason for status change..."
                />
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={!selectedStatus || isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading ? 'Changing...' : 'Change Status'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
```

## Phase 3: React Hooks

### Status Engine Hook

```tsx
// hooks/useStatusEngine.ts
import { useState, useCallback } from 'react';
import { api } from '../utils/api';

interface StatusChangeRequest {
  entity_type: string;
  entity_id: number;
  to_status: string;
  transition_reason?: string;
  business_context?: any;
  metadata?: any;
}

export const useStatusEngine = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStatus = useCallback(async (request: StatusChangeRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/status/change', request);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to change status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatusHistory = useCallback(async (entityType: string, entityId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/status/history/${entityType}/${entityId}`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load status history');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOverdueItems = useCallback(async (filters?: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/status/overdue', { params: filters });
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load overdue items');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    changeStatus,
    getStatusHistory,
    getOverdueItems,
    isLoading,
    error
  };
};
```

## Phase 4: Integration Patterns

### Order Integration Example

```tsx
// pages/OrderDetail.tsx
import React, { useEffect, useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { StatusTimeline } from '../components/StatusTimeline';
import { StatusChangeModal } from '../components/StatusChangeModal';
import { useStatusEngine } from '../hooks/useStatusEngine';

interface OrderDetailProps {
  orderId: number;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({ orderId }) => {
  const [statusHistory, setStatusHistory] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { getStatusHistory } = useStatusEngine();

  useEffect(() => {
    loadStatusHistory();
  }, [orderId]);

  const loadStatusHistory = async () => {
    try {
      const history = await getStatusHistory('order', orderId);
      setStatusHistory(history);
    } catch (error) {
      console.error('Failed to load status history:', error);
    }
  };

  const currentStatus = statusHistory?.current_status;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Order #{orderId}
            </h3>
            {currentStatus && (
              <StatusBadge
                status={currentStatus.current_status}
                statusLabel={currentStatus.current_status}
                statusColor="#3B82F6"
                isOverdue={currentStatus.is_overdue}
                slaDeadline={currentStatus.sla_deadline}
              />
            )}
          </div>
          
          <button
            onClick={() => setShowStatusModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Change Status
          </button>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Status History</h4>
          {statusHistory?.history && (
            <StatusTimeline history={statusHistory.history} />
          )}
        </div>
      </div>

      {showStatusModal && currentStatus && (
        <StatusChangeModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          entityType="order"
          entityId={orderId}
          currentStatus={currentStatus.current_status}
          allowedTransitions={['in_progress', 'completed', 'cancelled']} // Get from workflow
        />
      )}
    </div>
  );
};
```

## Phase 5: Workflow Configuration

### Default Workflow Setup Script

```javascript
// scripts/setup-default-workflows.js

// Order Workflow
const orderWorkflow = {
  entity_type: 'order',
  workflow_name: 'Standard Order Workflow',
  is_default: true,
  is_active: true,
  steps: [
    {
      status_name: 'new',
      status_label: 'New Order',
      status_color: '#E3F2FD',
      step_order: 1,
      sla_hours: 24,
      allowed_transitions: ['pending_approval', 'cancelled'],
      requires_approval: false
    },
    {
      status_name: 'pending_approval',
      status_label: 'Pending Approval',
      status_color: '#FFF3E0',
      step_order: 2,
      sla_hours: 48,
      allowed_transitions: ['approved', 'rejected', 'cancelled'],
      requires_approval: true,
      approval_role: 'manager'
    },
    {
      status_name: 'approved',
      status_label: 'Approved',
      status_color: '#E8F5E8',
      step_order: 3,
      sla_hours: 8,
      allowed_transitions: ['in_production', 'on_hold'],
      requires_approval: false
    },
    {
      status_name: 'in_production',
      status_label: 'In Production',
      status_color: '#FFA500',
      step_order: 4,
      sla_hours: 120,
      allowed_transitions: ['quality_check', 'on_hold'],
      requires_approval: false
    },
    {
      status_name: 'quality_check',
      status_label: 'Quality Check',
      status_color: '#9C27B0',
      step_order: 5,
      sla_hours: 8,
      allowed_transitions: ['ready_for_delivery', 'in_production'],
      requires_approval: false
    },
    {
      status_name: 'ready_for_delivery',
      status_label: 'Ready for Delivery',
      status_color: '#2196F3',
      step_order: 6,
      sla_hours: 24,
      allowed_transitions: ['delivered', 'on_hold'],
      requires_approval: false
    },
    {
      status_name: 'delivered',
      status_label: 'Delivered',
      status_color: '#4CAF50',
      step_order: 7,
      sla_hours: null,
      allowed_transitions: ['completed'],
      requires_approval: false
    },
    {
      status_name: 'completed',
      status_label: 'Completed',
      status_color: '#388E3C',
      step_order: 8,
      sla_hours: null,
      allowed_transitions: [],
      requires_approval: false,
      is_final: true
    }
  ]
};

// Implementation function to create workflows
async function setupDefaultWorkflows() {
  const workflows = [orderWorkflow];
  
  for (const workflow of workflows) {
    // Create workflow
    const workflowId = await xano.database.insert('status_workflows', {
      entity_type: workflow.entity_type,
      workflow_name: workflow.workflow_name,
      is_default: workflow.is_default,
      is_active: workflow.is_active
    });

    // Create workflow steps
    for (const step of workflow.steps) {
      await xano.database.insert('status_workflow_steps', {
        workflow_id: workflowId,
        ...step,
        allowed_transitions: JSON.stringify(step.allowed_transitions)
      });
    }
  }
}
```

## Phase 6: Performance Optimization

### Database Indexes

```sql
-- Essential indexes for status engine performance
CREATE INDEX idx_status_transitions_entity ON status_transitions (entity_type, entity_id);
CREATE INDEX idx_status_transitions_created_at ON status_transitions (created_at);
CREATE INDEX idx_entity_current_status_lookup ON entity_current_status (entity_type, entity_id);
CREATE INDEX idx_entity_current_status_overdue ON entity_current_status (is_overdue, sla_deadline);
CREATE INDEX idx_workflow_steps_workflow ON status_workflow_steps (workflow_id, step_order);
```

### Background Tasks Setup

1. **Overdue Detection**: Run every 15 minutes
2. **SLA Notifications**: Run every hour
3. **Status Analytics**: Run daily
4. **Workflow Performance**: Run weekly

## Testing Strategy

### Unit Tests
- Status transition validation
- SLA calculation accuracy
- Workflow step validation

### Integration Tests
- End-to-end status changes
- Real-time updates
- Notification delivery

### Performance Tests
- Bulk status operations
- Dashboard load times
- History query performance

---
*Implementation Guide Version: 1.0*
*Last Updated: June 1, 2025*
*Status Engine Tables: 93-96* 