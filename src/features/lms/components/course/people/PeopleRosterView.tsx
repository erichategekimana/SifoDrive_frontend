import React from 'react';
import { Search, Loader2, UserCheck, Crown } from 'lucide-react';
import type { CourseRosterUserDTO } from '../../../../../core/services/CourseGroupService';

interface PeopleRosterViewProps {
  filteredRoster: CourseRosterUserDTO[];
  isLoadingRoster: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  roleFilter: 'ALL' | 'Instructor' | 'Student';
  setRoleFilter: (val: 'ALL' | 'Instructor' | 'Student') => void;
}

export const PeopleRosterView: React.FC<PeopleRosterViewProps> = ({
  filteredRoster,
  isLoadingRoster,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Roster Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D0D5DD',
            borderRadius: '2px',
            padding: '6px 12px',
            width: '300px',
          }}
        >
          <Search size={15} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.82rem', background: 'transparent' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {(['ALL', 'Instructor', 'Student'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className="canvas-btn"
              style={{
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: roleFilter === r ? 700 : 500,
                backgroundColor: roleFilter === r ? '#0055A5' : '#FFFFFF',
                color: roleFilter === r ? '#FFFFFF' : '#374151',
                border: '1px solid',
                borderColor: roleFilter === r ? '#0055A5' : '#D0D5DD',
              }}
            >
              {r === 'ALL' ? 'All Roles' : `${r}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Roster List Card */}
      {isLoadingRoster ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
          <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} color="#0055A5" />
          <span style={{ fontSize: '0.84rem' }}>Loading course roster...</span>
        </div>
      ) : filteredRoster.length === 0 ? (
        <div className="canvas-card" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
          <UserCheck size={32} style={{ margin: '0 auto 8px' }} />
          <p style={{ margin: 0, fontSize: '0.85rem' }}>No participants found matching your criteria.</p>
        </div>
      ) : (
        <div className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div>
            {filteredRoster.map((u) => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: '1px solid #F1F5F9',
                  transition: 'background-color 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: u.avatar_color,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {u.profile_photo ? (
                      <img
                        src={u.profile_photo}
                        alt={u.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      u.name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>
                        {u.name}
                      </span>
                      {u.role === 'Instructor' && (
                        <Crown size={14} color="#4B5563" />
                      )}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                      {u.student_id ? `${u.student_id} • ` : ''}{u.category}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#058728', marginTop: '2px' }}>
                      {u.last_active}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      border: '1px solid #E5E7EB',
                      padding: '2px 8px',
                      borderRadius: '2px',
                    }}
                  >
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleRosterView;
