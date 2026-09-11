import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { LmsService } from '../../core/services/LmsService';
import { RoadSign } from '../../core/models/RoadSign';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';
import { useTranslation } from '../../context/I18nContext';

const DEFAULT_ROAD_SIGNS = [
  new RoadSign({
    id: 'sign-1',
    name: 'Hagarara (Stop Sign)',
    sign_code: 'B2a',
    category: 'PROHIBITORY',
    description: 'Icyapa gitegeka guhagarara burundu ku murongo wagenwe mbere yo gukomeza.',
    description_kinyarwanda: 'Mandatory complete stop at the stop line before proceeding when safe.',
  }),
  new RoadSign({
    id: 'sign-2',
    name: 'Tanga Inzira (Give Way / Yield)',
    sign_code: 'B1',
    category: 'WARNING',
    description: 'Tanga inzira ku binyabiziga biri mu muhanda mukuru.',
    description_kinyarwanda: 'Yield right of way to vehicles on the priority road ahead.',
  }),
  new RoadSign({
    id: 'sign-3',
    name: 'Umuvuduko Ntarengwa 40 km/h (Speed Limit)',
    sign_code: 'C43',
    category: 'PROHIBITORY',
    description: 'Umuvuduko ntarengwa wemewe ni ibilometero 40 mu isaha aho icyapa kiri.',
    description_kinyarwanda: 'Maximum permitted vehicle speed within this urban / school zone is 40 km/h.',
  }),
  new RoadSign({
    id: 'sign-4',
    name: 'Akayira k’Abanyamaguru (Pedestrian Crossing)',
    sign_code: 'A13b',
    category: 'WARNING',
    description: 'Uribona akayira k’abanyamaguru mu muhanda imbere. Gabanya umuvuduko utange inzira.',
    description_kinyarwanda: 'Approaching a designated zebra pedestrian crosswalk. Reduce speed.',
  }),
  new RoadSign({
    id: 'sign-5',
    name: 'Kuzenguruka Uruziga (Roundabout Ahead)',
    sign_code: 'D1b',
    category: 'MANDATORY',
    description: 'Gitegeka kugendera mu cyerekezo cy’uruziga rw’umuhanda. Tanga inzira ku binyabiziga biturutse ibumoso.',
    description_kinyarwanda: 'Compulsory roundabout traffic direction. Give way to traffic from the left.',
  }),
  new RoadSign({
    id: 'sign-6',
    name: 'Ibitaro / Ivuriro (Hospital)',
    sign_code: 'E23',
    category: 'INFORMATORY',
    description: 'Hafi y’ibitaro cyangwa ivuriro. Birabujijwe kuvuza ihoni bitari ngombwa.',
    description_kinyarwanda: 'Proximity to hospital or emergency medical services. Avoid unnecessary honking.',
  }),
];

export const RoadSignsPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [signs, setSigns] = useState<RoadSign[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSigns = async () => {
      try {
        const list = await LmsService.getInstance().getRoadSigns();
        setSigns(list.length > 0 ? list : DEFAULT_ROAD_SIGNS);
      } catch {
        setSigns(DEFAULT_ROAD_SIGNS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSigns();
  }, []);

  const categories = [
    { key: 'ALL', label: t('common.all') },
    { key: 'WARNING', label: t('roadSigns.warning') },
    { key: 'PROHIBITORY', label: t('roadSigns.prohibitory') },
    { key: 'MANDATORY', label: t('roadSigns.mandatory') },
    { key: 'INFORMATORY', label: t('roadSigns.informatory') },
  ];

  const filteredSigns = signs.filter((sign) => {
    const matchesCategory = activeCategory === 'ALL' || sign.category === activeCategory;
    const matchesSearch =
      sign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.descriptionKinyarwanda.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.signCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Badge variant="warning">{t('roadSigns.badge')}</Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('roadSigns.catalog')}</span>
        </div>
        <h1>{t('roadSigns.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>
          {t('roadSigns.subtitle')}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: activeCategory === cat.key ? 'var(--primary)' : 'var(--border-subtle)',
                background: activeCategory === cat.key ? 'var(--primary-glow)' : 'var(--bg-surface-elevated)',
                color: activeCategory === cat.key ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ minWidth: '260px' }}>
          <Input
            placeholder={t('roadSigns.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
      </div>

      {isLoading ? (
        <Spinner message={t('common.loading')} />
      ) : (
        <div className="grid grid-cols-3">
          {filteredSigns.map((sign) => (
            <Card key={sign.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <Badge variant="neutral">{sign.signCode || 'CODE'}</Badge>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: sign.getCategoryColor() }}>
                    {sign.category}
                  </span>
                </div>

                {/* Sign Icon Representation */}
                <div
                  style={{
                    height: '110px',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: sign.category === 'MANDATORY' ? '50%' : sign.category === 'WARNING' ? '12px' : '50%',
                      border: `4px solid ${sign.getCategoryColor()}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--bg-surface)',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: sign.getCategoryColor(),
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    {sign.signCode}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{sign.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '10px' }}>
                  {sign.description}
                </p>
              </div>

              {sign.descriptionKinyarwanda && (
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                  }}
                >
                  {language === 'rw' ? `🇬🇧 ${sign.descriptionKinyarwanda}` : `🇷🇼 ${sign.description}`}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
