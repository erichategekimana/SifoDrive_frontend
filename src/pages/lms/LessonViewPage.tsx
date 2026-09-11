import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { LmsService } from '../../core/services/LmsService';
import { Lesson } from '../../core/models/Lesson';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/I18nContext';

export const LessonViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { t, language } = useTranslation();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      const isRw = language === 'rw';
      try {
        const lms = LmsService.getInstance();
        if (id) {
          const data = await lms.getLessonDetail(id);
          setLesson(data);
        }
      } catch {
        // Fallback demo content in Kinyarwanda or English
        const rwContent = `
### Amategeko y'Umuhanda mu Rwanda — Amabwiriza Rusange yo Kunyuranaho

Mu Rwanda, ibinyabiziga bigomba **kugendera mu ruhande rw'iburyo** bw'umuhanda, kandi kunyuranaho bikorwa ubusanzwe unyuze mu **ruhande rw'ibumoso**.

#### 1. Ibyo Gusuzuma Mbere yo Kunyuranaho
Mbere yo gutangira kunyuranaho:
1. **Reba mu ndorerwamo**: Menya neza ko nta kinyabiziga kiguturutse inyuma cyatangiye kukunyuraho.
2. **Kureba imbere kure hashoboka**: Reba neza ko umuhanda w'imbere ufunguye mu ntera ihagije, nta makorosi, nta bihanamanga cyangwa ibindi binyabiziga biteza akaga.
3. **Gukoresha ikimenyetso (Kinyoteri)**: Koresha ikimenyetso kigaragaza icyerekezo kugira ngo umenyeshe abandi bagenzi.
4. **Umuvuduko uhagije**: Ntukanyuraneho niba ikinyabiziga cyawe kidafite ingufu zo kubirangiza byihuse utarenze umuvuduko ntarengwa wemewe.

#### 2. Ahantu Bibujijwe Byimazeyo Kunyuranaho
* Ahari umurongo wera udacitse (**Umurongo wera udacitse**).
* Mu ntera iri munsi ya metero 50 uvuye ku masangano cyangwa ahandi habera ibizamini.
* Akayira k'abanyamaguru (**Akayira k'abanyamaguru**).
* Mu makorosi afunze, hejuru y'umusozi, cyangwa mu bihe by'igihu n'imvura nyinshi.

#### 3. Ibyo Gukora Iyo Undi Mugenzi Ari Kukunyuraho
Iyo undi mushoferi atangiye kukunyuraho:
* **Gumana umuvuduko cyangwa uwugabanye** — birabujijwe cyane kongera umuvuduko igihe uri kunyurwaho.
* Guma mu ruhande rw'iburyo neza kugira ngo uhe mugenzi wawe inzira ihagije yo gutambuka mu mutekano.
        `.trim();

        const enContent = `
### Rwanda Highway Code — General Overtaking Rules

In Rwanda, vehicles must keep to the **right-hand side** of the carriageway, and overtaking is normally carried out on the **left**.

#### 1. Mandatory Pre-Overtaking Checks
Before initiating an overtake:
1. **Rearview Mirror Check**: Confirm that no driver behind you has already commenced overtaking you.
2. **Clear Forward Visibility**: Ensure that the forward road is clear for an adequate distance, free from bends, dips, or oncoming traffic.
3. **Signal (Clignotant)**: Indicate your intention clearly to alert other road users.
4. **Adequate Speed Reserve**: Do not attempt to overtake if your vehicle cannot swiftly complete the maneuver without exceeding local statutory speed limits.

#### 2. Where Overtaking is Strictly Forbidden
* Across continuous white single or double lines (**Umurongo wera udacitse**).
* Within 50 meters of an intersection or railway level crossing.
* On pedestrian crossings (**Akayira k'abanyamaguru**).
* At blind curves, hill crests, or during dense fog/heavy rainfall.

#### 3. Giving Way When Being Overtaken
If another driver begins overtaking you:
* **Maintain or decrease your speed** — it is strictly illegal to accelerate while being overtaken.
* Keep firmly to the right side of your lane to allow generous safety clearance.
        `.trim();

        setLesson(
          new Lesson({
            id: id || 'les-1',
            module: 'mod-1',
            title: isRw
              ? '1.2 Kunyuranaho no Kugendera mu Mukono Wabyo'
              : '1.2 Overtaking & Lane Discipline (Kunyuranaho no Kugendera mu Mukono Wabyo)',
            lesson_type: 'TEXT',
            order: 2,
            content: isRw ? rwContent : enContent,
            duration_minutes: 12,
            is_free_preview: true,
            is_completed: false,
          })
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [id, language]);

  const handleMarkComplete = async () => {
    if (!lesson) return;
    setIsCompleting(true);
    try {
      await LmsService.getInstance().markLessonComplete(lesson.id);
      success(t('lms.lessonCompletedToast'));
      navigate('/courses');
    } catch (err: any) {
      error(err.message || t('common.errorOccurred'));
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return <Spinner message={t('common.loading')} />;
  }

  if (!lesson) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>{t('lms.lessonNotFound')}</h2>
        <Link to="/courses" className="btn btn-primary" style={{ marginTop: '16px' }}>
          {t('lms.backToOutline')}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link
          to="/courses"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          <ArrowLeft size={18} />
          <span>{t('lms.backToModules')}</span>
        </Link>
        <Badge variant="info">{lesson.getBadgeLabel()}</Badge>
      </div>

      {/* Lesson Reader Card */}
      <Card>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{lesson.title}</h1>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>
              {t('lms.readingTime')}{' '}
              {t('lms.readingTimeValue', { minutes: lesson.durationMinutes })}
            </span>
            <span>{t('lms.languageDual')}</span>
          </div>
        </div>

        {/* Content Body */}
        <div
          style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {lesson.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} style={{ fontSize: '1.3rem', marginTop: '12px', color: 'var(--primary-light)' }}>
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('#### ')) {
              return (
                <h4 key={index} style={{ fontSize: '1.1rem', marginTop: '8px', color: 'var(--accent-400)' }}>
                  {paragraph.replace('#### ', '')}
                </h4>
              );
            }
            if (paragraph.startsWith('* ') || paragraph.startsWith('1. ')) {
              return (
                <div key={index} style={{ paddingLeft: '16px', borderLeft: '3px solid var(--border-subtle)' }}>
                  {paragraph.split('\n').map((line, li) => (
                    <div key={li} style={{ marginBottom: '6px' }}>{line}</div>
                  ))}
                </div>
              );
            }
            return <p key={index}>{paragraph}</p>;
          })}
        </div>

        {/* Completion Action */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {language === 'rw'
              ? 'Menya neza ko wumvise iki gice mbere yo gukomeza ku kizamini cy\'imyitozo.'
              : 'Ensure you understand this chapter before proceeding to the quiz assessment.'}
          </div>
          <Button
            variant="primary"
            onClick={handleMarkComplete}
            isLoading={isCompleting}
            icon={<CheckCircle2 size={18} />}
          >
            {t('lms.markCompleted')}
          </Button>
        </div>
      </Card>
    </div>
  );
};
