import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '../../../components/common/Badge';
import type { SMSTemplateItem } from '../../../core/services/AdminService';

interface SMSTemplatesSectionProps {
  templates: SMSTemplateItem[];
  onUseTemplate: (tpl: SMSTemplateItem) => void;
}

export const SMSTemplatesSection: React.FC<SMSTemplatesSectionProps> = ({
  templates,
  onUseTemplate,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
          System templates registered across notifications. Click "Use in Single SMS" to populate the dispatcher.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {templates.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            No templates configured in the system.
          </div>
        ) : (
          templates.map((tpl) => (
            <div
              key={tpl.id}
              className="glass-panel"
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {tpl.name || tpl.template_code || tpl.code}
                  </strong>
                  <Badge variant="neutral" style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
                    {tpl.language ? tpl.language.toUpperCase() : 'RW'}
                  </Badge>
                </div>

                <div
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-surface-elevated)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    lineHeight: 1.5,
                    fontFamily: 'monospace',
                  }}
                >
                  {tpl.body_template || tpl.body}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {tpl.notification_type || tpl.channel || 'SMS'}
                </span>
                <button
                  onClick={() => onUseTemplate(tpl)}
                  className="btn btn-secondary btn-xs"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Use in Single SMS</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
