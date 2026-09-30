import React from 'react';
import { Badge } from '../../../components/common/Badge';

export function getExamStatusBadge(status: string): React.ReactElement {
  switch (status) {
    case 'SUBMITTED':
    case 'BOARD_REVIEW':
      return <Badge variant="warning">Stage 1: Board Review</Badge>;
    case 'TRAINING_REVIEW':
      return <Badge variant="info">Stage 2: Training Audit</Badge>;
    case 'SYSTEM_REVIEW':
      return <Badge variant="info">Stage 3: System Approval</Badge>;
    case 'APPROVED':
      return <Badge variant="success">Approved</Badge>;
    case 'PUBLISHED':
      return <Badge variant="neutral">Published</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">Rejected</Badge>;
    case 'FLAGGED':
      return <Badge variant="danger">Flagged</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}
