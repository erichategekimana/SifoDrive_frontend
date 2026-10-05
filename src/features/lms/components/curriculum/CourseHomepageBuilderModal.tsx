import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Edit3,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Type,
  Image as ImageIcon,
  BookOpen,
  PlayCircle,
  Sparkles,
  Link2,
  Crop,
  GraduationCap,
  Users,
  Layout,
  Upload,
  ShieldCheck,
  RotateCcw,
  Compass,
} from 'lucide-react';
import {
  Course,
  type CourseHomepageBlock,
  type CourseHomepageData,
} from '../../../../core/models/Course';
import { AdminService } from '../../../../core/services/AdminService';
import { LmsService } from '../../../../core/services/LmsService';
import { useToast } from '../../../../context/ToastContext';
import { RenderCourseHomepage } from '../course/RenderCourseHomepage';

interface CourseHomepageBuilderModalProps {
  course: Course | any;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (savedData?: any) => void;
  initialModules?: any[];
}

export const CourseHomepageBuilderModal: React.FC<CourseHomepageBuilderModalProps> = ({
  course,
  isOpen,
  onClose,
  onSaved,
  initialModules = [],
}) => {
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();
  const lmsService = LmsService.getInstance();

  // Mode: Editor vs Student Preview vs Tutor Preview
  const [activeMode, setActiveMode] = useState<'editor' | 'student_preview' | 'tutor_preview'>('editor');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
  const [availableModules, setAvailableModules] = useState<any[]>(() => {
    if (Array.isArray(initialModules) && initialModules.length > 0) return initialModules;
    if (Array.isArray(course?.modules) && course.modules.length > 0) return course.modules;
    return [];
  });

  // Helper: Build Full Canvas LMS Reference Template as 100% Modular Editable Blocks
  const buildDefaultCanvasTemplate = (): CourseHomepageBlock[] => [
    {
      id: `block-hero-${Date.now()}`,
      type: 'hero_banner',
      title: course.title || 'Road Regulations & Traffic Signs',
      subtitle: course.description || 'Master Rwanda driving legislation, roundabout circulation, right-of-way priority, and road signage to ensure passing your provisional theory exam on the first attempt.',
      showBadge: true,
      badgeText: 'Official RNP Provisional Curriculum',
      badgeTextColor: '#FF6B6B',
      badgeBgColor: 'rgba(217, 56, 30, 0.25)',
      bannerGradient: 'linear-gradient(135deg, #07192F 0%, #0D2C54 50%, #173E73 100%)',
      buttons: [
        { id: `btn-mod-${Date.now()}`, label: 'Go to Modules', actionType: 'modules', style: 'red_primary' },
        { id: `btn-live-${Date.now()}`, label: 'Live Class Schedule', actionType: 'live', style: 'glass_outline' },
      ],
      showStats: true,
      heroCard1Badge: 'STOP',
      heroCard1Title: 'Regulatory Priority',
      heroCard1Subtitle: 'Article 34 - Full stop & yield',
      showHeroCard1: true,
      heroCard2Icon: 'compass',
      heroCard2Title: 'Roundabout Circulation',
      heroCard2Subtitle: 'Priority to circulating traffic',
      showHeroCard2: true,
      heroPassingRateLabel: 'RNP Passing Rate',
      heroPassingRateValue: '88% Minimum (18/20)',
      showHeroPassingRate: true,
      showHeroStatsSummary: true,
    },
    {
      id: `block-expectation-${Date.now()}`,
      type: 'text',
      title: 'Learner Engagement Expectation',
      content: 'Students are expected to lead the learning process with 100% engagement, the Instructor ONLY guides the students.',
      fontFamily: 'Inter, sans-serif',
      fontSize: 16,
      isBold: true,
      isItalic: false,
      isUnderline: false,
      textAlign: 'left',
      textColor: '#C22B14',
      bgColor: 'rgba(217, 56, 30, 0.08)',
    },
    {
      id: `block-overview-${Date.now()}`,
      type: 'text',
      title: 'Course Overview & Guidance',
      content: 'Welcome to this comprehensive driving curriculum. Study each module systematically, practice with interactive Canva road sign presentations, and complete all quizzes to qualify for the official provisional driving exam.',
      fontFamily: 'Inter, sans-serif',
      fontSize: 15,
      isBold: false,
      isItalic: false,
      isUnderline: false,
      textAlign: 'left',
      textColor: '#1E293B',
      bgColor: '',
    },
    {
      id: `block-outcomes-${Date.now()}`,
      type: 'outcomes',
      title: 'Core Learning Objectives',
      content: `• Master right-of-way priority at roundabouts and multi-lane Kigali junctions.\n• Memorize all official RTDA Rwanda road signs and pavement markings.\n• Understand mandatory vehicle safety equipment and defensive driving strategies.\n• Score 18/20 (88%+) or higher on the official RNP provisional test.`,
    },
    {
      id: `block-signs-${Date.now()}`,
      type: 'image',
      title: 'Essential Road Signs Visual Guide',
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80',
      imageWidth: 100,
      imageCropRatio: '16:9',
      imageRadius: 8,
      imageCaption: 'Rwanda Highway Code Visual Navigation & Priority Signs',
      textAlign: 'center',
    },
    {
      id: `block-resources-${Date.now()}`,
      type: 'resources',
      title: 'Essential Course Study Resources',
      links: [
        {
          title: 'Official Rwanda Highway Code PDF',
          url: 'https://mininfra.gov.rw',
          description: 'Download the comprehensive traffic regulation booklet',
        },
        {
          title: 'Canva Interactive Road Signs Slide Deck',
          url: 'https://canva.com',
          description: 'Interactive visual traffic signs slide deck',
        },
      ],
    },
    {
      id: `block-module-${Date.now()}`,
      type: 'module_attach',
      title: (course.modules && course.modules[0]?.title) || 'Module 1: General Traffic Rules',
      moduleId: (course.modules && course.modules[0]?.id) || '',
      content: 'Recommended foundational study module for all enrolled learners.',
    },
  ];

  // Parse Blocks from Course Data (supporting both camelCase and snake_case)
  const parseBlocksFromData = (data: any): CourseHomepageBlock[] => {
    if (!data) return buildDefaultCanvasTemplate();
    const rawBlocks = data.blocks;
    if (Array.isArray(rawBlocks) && rawBlocks.length > 0) {
      const hasHero = rawBlocks.some((b: any) => b.type === 'hero_banner' || b.type === 'banner');
      if (hasHero) {
        return rawBlocks;
      }
      // Migrate: Prepend hero_banner block so training admin can immediately edit or remove it
      const banner = data.banner || {};
      const heroBlock: CourseHomepageBlock = {
        id: `block-hero-${course.id}`,
        type: 'hero_banner',
        title: banner.title || course.title || 'Road Regulations & Traffic Signs',
        subtitle: banner.subtitle || course.description || 'Master Rwanda driving legislation, roundabout circulation, right-of-way priority, and road signage to ensure passing your provisional theory exam on the first attempt.',
        showBadge: true,
        badgeText: banner.badge || 'Official RNP Provisional Curriculum',
        badgeTextColor: '#FF6B6B',
        badgeBgColor: 'rgba(217, 56, 30, 0.25)',
        bannerGradient: banner.gradient || 'linear-gradient(135deg, #07192F 0%, #0D2C54 50%, #173E73 100%)',
        buttons: [
          { id: 'btn-1', label: 'Go to Modules', actionType: 'modules', style: 'red_primary' },
          { id: 'btn-2', label: 'Live Class Schedule', actionType: 'live', style: 'glass_outline' },
        ],
        showStats: banner.showStats !== false,
        heroCard1Badge: 'STOP',
        heroCard1Title: 'Regulatory Priority',
        heroCard1Subtitle: 'Article 34 - Full stop & yield',
        showHeroCard1: true,
        heroCard2Icon: 'compass',
        heroCard2Title: 'Roundabout Circulation',
        heroCard2Subtitle: 'Priority to circulating traffic',
        showHeroCard2: true,
        heroPassingRateLabel: 'RNP Passing Rate',
        heroPassingRateValue: '88% Minimum (18/20)',
        showHeroPassingRate: true,
        showHeroStatsSummary: true,
      };
      return [heroBlock, ...rawBlocks];
    }
    // If blocks was explicitly saved as empty array
    if (Array.isArray(rawBlocks) && rawBlocks.length === 0 && (data.enabled !== undefined || data.banner !== undefined)) {
      return [];
    }
    return buildDefaultCanvasTemplate();
  };

  const initialData = course.homepageData || course.homepage_data || null;

  const [homepageData, setHomepageData] = useState<CourseHomepageData>(() => ({
    enabled: initialData?.enabled ?? true,
    layout: initialData?.layout,
    banner: initialData?.banner,
    blocks: parseBlocksFromData(initialData),
  }));

  const [activeEditingBlockId, setActiveEditingBlockId] = useState<string | null>(() => {
    const initBlocks = parseBlocksFromData(initialData);
    return initBlocks && initBlocks.length > 0 ? initBlocks[0].id : null;
  });

  // Synchronize availableModules if initialModules prop updates
  useEffect(() => {
    if (Array.isArray(initialModules) && initialModules.length > 0 && availableModules.length === 0) {
      setAvailableModules(initialModules);
    }
  }, [initialModules]);

  // Re-sync whenever the modal is opened or the course changes
  useEffect(() => {
    if (!isOpen || !course?.id) return;

    // 1. Immediately apply from the latest course prop object
    const localData = course.homepageData || course.homepage_data;
    if (localData) {
      const parsed = parseBlocksFromData(localData);
      setHomepageData({
        enabled: localData.enabled ?? true,
        layout: localData.layout,
        banner: localData.banner,
        blocks: parsed,
      });
      if (parsed.length > 0) {
        setActiveEditingBlockId(parsed[0].id);
      }
    }

    let isCancelled = false;

    // 2. Fetch the authoritative persisted homepage data from backend
    adminService
      .getCourseHomepage(course.id)
      .then((res: any) => {
        if (isCancelled) return;
        const apiData = res?.homepage_data || (res?.blocks ? res : null);
        if (apiData && (apiData.blocks || apiData.enabled !== undefined)) {
          const parsed = parseBlocksFromData(apiData);
          setHomepageData({
            enabled: apiData.enabled ?? true,
            layout: apiData.layout,
            banner: apiData.banner,
            blocks: parsed,
          });
          if (parsed.length > 0) {
            setActiveEditingBlockId((curr) => {
              if (curr && parsed.some((b) => b.id === curr)) return curr;
              return parsed[0].id;
            });
          }
          // Update course reference in memory
          course.homepage_data = apiData;
          course.homepageData = apiData;
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch fresh course homepage data:', err);
      });

    // 3. Fetch comprehensive course curriculum (modules + nested lessons)
    setIsLoadingCurriculum(true);
    const loadCurriculum = async () => {
      try {
        const detail = await lmsService.getCourseDetail(course.id);
        if (isCancelled) return;
        if (detail && Array.isArray(detail.modules) && detail.modules.length > 0) {
          setAvailableModules(detail.modules);
          if (course) {
            course.modules = detail.modules;
          }
          setIsLoadingCurriculum(false);
          return;
        }
      } catch (err) {
        console.warn('Could not fetch course detail for curriculum modules/lessons:', err);
      }

      // Fallback: load modules and individual lessons via adminService
      try {
        const rawMods = await adminService.getCourseModules(course.id);
        if (isCancelled) return;
        if (Array.isArray(rawMods) && rawMods.length > 0) {
          const populatedMods = await Promise.all(
            rawMods.map(async (m: any) => {
              if (Array.isArray(m.lessons) && m.lessons.length > 0) {
                return m;
              }
              try {
                const lessons: any = await adminService.getModuleLessons(m.id);
                return {
                  ...m,
                  lessons: Array.isArray(lessons) ? lessons : lessons?.results || [],
                };
              } catch {
                return { ...m, lessons: [] };
              }
            })
          );
          if (!isCancelled) {
            setAvailableModules(populatedMods);
            if (course) {
              course.modules = populatedMods;
            }
          }
        }
      } catch (fallbackErr) {
        console.warn('Fallback modules fetch also failed:', fallbackErr);
      } finally {
        if (!isCancelled) {
          setIsLoadingCurriculum(false);
        }
      }
    };

    loadCurriculum();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, course?.id]);

  if (!isOpen) return null;

  // Flattened modules and lessons for attachments
  const modules: any[] = availableModules.length > 0 ? availableModules : (course?.modules || []);
  const allLessons: any[] = modules.flatMap((m: any) =>
    (m.lessons || []).map((l: any) => ({
      id: l.id,
      title: l.title,
      durationMinutes: l.durationMinutes ?? l.duration_minutes ?? 15,
      moduleTitle: m.title,
      moduleId: m.id,
    }))
  );

  // --- Reset to Full Template ---
  const handleResetToTemplate = () => {
    const templ = buildDefaultCanvasTemplate();
    setHomepageData({
      enabled: true,
      blocks: templ,
    });
    setActiveEditingBlockId(templ[0].id);
    success('Reset to full editable Canvas LMS Template!');
  };

  // --- Clear All Blocks ---
  const handleClearAllBlocks = () => {
    setHomepageData({
      enabled: true,
      blocks: [],
    });
    setActiveEditingBlockId(null);
  };

  // --- Block Operations ---
  const handleAddBlock = (type: CourseHomepageBlock['type']) => {
    const newId = `block-${Date.now()}`;
    let newBlock: CourseHomepageBlock;

    switch (type) {
      case 'hero_banner':
        newBlock = {
          id: newId,
          type: 'hero_banner',
          title: course.title || 'Road Regulations & Traffic Signs',
          subtitle: course.description || 'Master Rwanda driving legislation, roundabout circulation, right-of-way priority, and road signage to ensure passing your provisional theory exam on the first attempt.',
          showBadge: true,
          badgeText: 'Official RNP Provisional Curriculum',
          badgeTextColor: '#FF6B6B',
          badgeBgColor: 'rgba(217, 56, 30, 0.25)',
          bannerGradient: 'linear-gradient(135deg, #07192F 0%, #0D2C54 50%, #173E73 100%)',
          buttons: [
            { id: `btn-1-${Date.now()}`, label: 'Go to Modules', actionType: 'modules', style: 'red_primary' },
            { id: `btn-2-${Date.now()}`, label: 'Live Class Schedule', actionType: 'live', style: 'glass_outline' },
          ],
          showStats: true,
        };
        break;
      case 'text':
        newBlock = {
          id: newId,
          type: 'text',
          title: 'New Section Heading',
          content: 'Input your detailed instructional text or announcements here.',
          fontFamily: 'Inter, sans-serif',
          fontSize: 15,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          textAlign: 'left',
          textColor: '#1E293B',
          bgColor: '',
        };
        break;
      case 'image':
        newBlock = {
          id: newId,
          type: 'image',
          title: 'Course Visual Asset',
          imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop&q=80',
          imageWidth: 100,
          imageCropRatio: '16:9',
          imageRadius: 8,
          imageCaption: 'Rwanda Highway Code Practical Overview',
          textAlign: 'center',
        };
        break;
      case 'module_attach':
        newBlock = {
          id: newId,
          type: 'module_attach',
          title: modules[0]?.title || 'Attached Course Module',
          moduleId: modules[0]?.id || '',
          content: 'Recommended foundational study module for all enrolled learners.',
        };
        break;
      case 'lesson_attach':
        newBlock = {
          id: newId,
          type: 'lesson_attach',
          title: allLessons[0]?.title || 'Featured Lesson Material',
          lessonId: allLessons[0]?.id || '',
          lessonTitle: allLessons[0]?.title || 'Lesson Resource',
          lessonDuration: allLessons[0]?.durationMinutes || 20,
          content: 'Key lesson highlighting defensive driving techniques and visual road signs.',
        };
        break;
      case 'resources':
        newBlock = {
          id: newId,
          type: 'resources',
          title: 'Essential Course Study Resources',
          links: [
            {
              title: 'Official Rwanda Highway Code PDF',
              url: 'https://example.com/handbook.pdf',
              description: 'Download the comprehensive traffic regulation booklet',
            },
            {
              title: 'Canva Interactive Road Signs Slide Deck',
              url: 'https://www.canva.com/design/DAFexample/view',
              description: 'Interactive slide deck for visual traffic signs',
            },
          ],
        };
        break;
      case 'outcomes':
        newBlock = {
          id: newId,
          type: 'outcomes',
          title: 'What You Will Learn',
          content: '• Priority rules at intersections\n• Rwanda National Police exam preparation\n• Safe vehicle maneuvering and defensive driving',
        };
        break;
      default:
        return;
    }

    setHomepageData((prev) => ({
      ...prev,
      blocks: [...(prev.blocks || []), newBlock],
    }));
    setActiveEditingBlockId(newId);
  };

  const handleUpdateBlock = (id: string, updates: Partial<CourseHomepageBlock>) => {
    setHomepageData((prev) => ({
      ...prev,
      blocks: (prev.blocks || []).map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  const handleDeleteBlock = (id: string) => {
    setHomepageData((prev) => ({
      ...prev,
      blocks: (prev.blocks || []).filter((b) => b.id !== id),
    }));
    if (activeEditingBlockId === id) {
      setActiveEditingBlockId(null);
    }
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = [...(homepageData.blocks || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const temp = blocks[index];
    blocks[index] = blocks[targetIndex];
    blocks[targetIndex] = temp;

    setHomepageData((prev) => ({ ...prev, blocks }));
  };

  // Image Upload handler (Base64 data URL)
  const handleImageUpload = (blockId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        handleUpdateBlock(blockId, { imageUrl: result });
      }
    };
    reader.readAsDataURL(file);
  };

  // Save to Backend
  const handleSaveHomepage = async () => {
    try {
      setIsSaving(true);
      const res = await adminService.updateCourseHomepage(course.id, homepageData);
      const savedData = res?.homepage_data || homepageData;
      // Mutate local course reference in memory so reopening modal immediately shows saved data
      course.homepage_data = savedData;
      course.homepageData = savedData;
      success(`Course Home Page for "${course.title}" saved successfully!`);
      if (onSaved) onSaved(savedData);
      onClose();
    } catch (err: any) {
      console.error('Failed to save course homepage:', err);
      toastError(err?.message || 'Failed to save course homepage.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeBlock = (homepageData.blocks || []).find((b) => b.id === activeEditingBlockId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 25, 47, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1240px',
          height: '92vh',
          backgroundColor: '#0F172A',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#1E293B',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0055A5 0%, #2563EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Layout size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Course Home Page Studio
                </h2>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#93C5FD',
                  }}
                >
                  Training Admin Tool
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                Course: <strong style={{ color: '#F1F5F9' }}>{course.title}</strong> ({course.code})
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#0F172A',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              onClick={() => setActiveMode('editor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeMode === 'editor' ? '#2563EB' : 'transparent',
                color: activeMode === 'editor' ? '#FFFFFF' : '#94A3B8',
                transition: 'all 0.2s',
              }}
            >
              <Edit3 size={14} />
              <span>Block Editor</span>
            </button>

            <button
              onClick={() => setActiveMode('student_preview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeMode === 'student_preview' ? '#059669' : 'transparent',
                color: activeMode === 'student_preview' ? '#FFFFFF' : '#94A3B8',
                transition: 'all 0.2s',
              }}
            >
              <GraduationCap size={14} />
              <span>Student Dashboard Preview</span>
            </button>

            <button
              onClick={() => setActiveMode('tutor_preview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeMode === 'tutor_preview' ? '#7C3AED' : 'transparent',
                color: activeMode === 'tutor_preview' ? '#FFFFFF' : '#94A3B8',
                transition: 'all 0.2s',
              }}
            >
              <Users size={14} />
              <span>Tutor Dashboard Preview</span>
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleSaveHomepage}
              disabled={isSaving}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontWeight: 700 }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving...' : 'Save Home Page'}</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* ============================================================= */}
          {/* MODE 1: BLOCK EDITOR */}
          {/* ============================================================= */}
          {activeMode === 'editor' && (
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
              {/* Left Column: Blocks Manager List & Insert Palette */}
              <div
                style={{
                  width: '360px',
                  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#111827',
                }}
              >
                {/* Palette Actions */}
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.05em' }}>
                    INSERT CONTENT BLOCKS
                  </span>

                  {/* Primary Hero Banner Button */}
                  <button
                    onClick={() => handleAddBlock('hero_banner')}
                    className="btn btn-sm"
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      marginBottom: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(30, 58, 95, 0.75)',
                      border: '1px solid #3B82F6',
                      color: '#93C5FD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Layout size={15} color="#60A5FA" />
                    <span>+ Blue Hero Container & Buttons</span>
                  </button>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                      marginTop: '6px',
                    }}
                  >
                    <button
                      onClick={() => handleAddBlock('text')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '6px 8px' }}
                    >
                      <Type size={13} color="#60A5FA" />
                      <span>Rich Text</span>
                    </button>
                    <button
                      onClick={() => handleAddBlock('image')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '6px 8px' }}
                    >
                      <ImageIcon size={13} color="#34D399" />
                      <span>Image / Graphic</span>
                    </button>
                    <button
                      onClick={() => handleAddBlock('module_attach')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '6px 8px' }}
                    >
                      <BookOpen size={13} color="#FBBF24" />
                      <span>Attach Module</span>
                    </button>
                    <button
                      onClick={() => handleAddBlock('lesson_attach')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '6px 8px' }}
                    >
                      <PlayCircle size={13} color="#F472B6" />
                      <span>Attach Lesson</span>
                    </button>
                    <button
                      onClick={() => handleAddBlock('resources')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '6px 8px' }}
                    >
                      <Link2 size={13} color="#A78BFA" />
                      <span>Resource Links</span>
                    </button>
                    <button
                      onClick={() => handleAddBlock('outcomes')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', justifyContent: 'flex-start', padding: '6px 8px' }}
                    >
                      <Sparkles size={13} color="#FCD34D" />
                      <span>Outcomes List</span>
                    </button>
                  </div>
                </div>

                {/* Blocks List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.05em' }}>
                      PAGE STRUCTURE ({(homepageData.blocks || []).length} BLOCKS)
                    </span>
                  </div>

                  {(homepageData.blocks || []).map((block, index) => {
                    const isSelected = block.id === activeEditingBlockId;
                    return (
                      <div
                        key={block.id}
                        onClick={() => setActiveEditingBlockId(block.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.18)' : '#1F2937',
                          border: isSelected ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 700 }}>
                            #{index + 1}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? '#93C5FD' : '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {block.title || block.type.toUpperCase()}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>
                              {(block.type === 'hero_banner' || block.type === 'banner') && 'Blue Hero Container • Red Badge & Buttons'}
                              {block.type === 'text' && 'Rich text content'}
                              {block.type === 'image' && `Image (${block.imageCropRatio || '16:9'}, ${block.imageWidth || 100}%)`}
                              {block.type === 'module_attach' && 'Module shortcut card'}
                              {block.type === 'lesson_attach' && 'Lesson launch card'}
                              {block.type === 'resources' && 'External & slide links'}
                              {block.type === 'outcomes' && 'Learning outcomes checklist'}
                            </span>
                          </div>
                        </div>

                        {/* Reorder and Delete controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleMoveBlock(index, 'up')}
                            disabled={index === 0}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: index === 0 ? '#4B5563' : '#9CA3AF',
                              cursor: index === 0 ? 'default' : 'pointer',
                              padding: '3px',
                            }}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMoveBlock(index, 'down')}
                            disabled={index === (homepageData.blocks || []).length - 1}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: index === (homepageData.blocks || []).length - 1 ? '#4B5563' : '#9CA3AF',
                              cursor: index === (homepageData.blocks || []).length - 1 ? 'default' : 'pointer',
                              padding: '3px',
                            }}
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBlock(block.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '3px',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Template Reset / Clear actions */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleResetToTemplate}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', width: '100%', justifyContent: 'center', gap: '6px' }}
                  >
                    <RotateCcw size={13} color="#60A5FA" />
                    <span>Reset to Canvas LMS Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllBlocks}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      padding: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                  >
                    Clear All Blocks (Blank Canvas)
                  </button>
                </div>
              </div>

              {/* Right Column: Selected Block Settings & Formatter */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#0F172A',
                  overflowY: 'auto',
                  padding: '24px 32px',
                }}
              >
                {activeBlock ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                          Edit {activeBlock.type.replace('_', ' ').toUpperCase()} Block
                        </h3>
                        <span style={{ fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}>
                          ID: {activeBlock.id}
                        </span>
                      </div>
                    </div>

                    {/* Block Title Field */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                        {(activeBlock.type === 'hero_banner' || activeBlock.type === 'banner')
                          ? 'Hero Banner Main Course Title'
                          : 'Block Title / Heading'}
                      </label>
                      <input
                        type="text"
                        value={activeBlock.title || ''}
                        onChange={(e) => handleUpdateBlock(activeBlock.id, { title: e.target.value })}
                        placeholder={
                          (activeBlock.type === 'hero_banner' || activeBlock.type === 'banner')
                            ? 'e.g. ROAD REGULATIONS & TRAFFIC SIGNS'
                            : 'Enter block title...'
                        }
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#FFFFFF',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>

                    {/* ------------------------------------------------ */}
                    {/* HERO BANNER / BLUE CONTAINER CONTROLS */}
                    {/* ------------------------------------------------ */}
                    {(activeBlock.type === 'hero_banner' || activeBlock.type === 'banner') && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '20px',
                          padding: '20px',
                          borderRadius: '8px',
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#93C5FD', letterSpacing: '0.05em' }}>
                            HERO CONTAINER & BANNER CUSTOMIZATION
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            Canvas LMS Primary Hero
                          </span>
                        </div>

                        {/* SECTION A: Background Styling & Color Presets */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', marginBottom: '8px' }}>
                            Container Background Color Themes
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {[
                              { name: 'Kigali Midnight (Default)', val: 'linear-gradient(135deg, #07192F 0%, #0D2C54 50%, #173E73 100%)' },
                              { name: 'Sifo Royal Navy', val: 'linear-gradient(135deg, #0A2540 0%, #0055A5 100%)' },
                              { name: 'Dark Slate Steel', val: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' },
                              { name: 'Rwanda Emerald', val: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)' },
                              { name: 'Crimson Ruby', val: 'linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)' },
                              { name: 'Night Violet', val: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 100%)' },
                              { name: 'Classic Obsidian', val: 'linear-gradient(135deg, #0B0F17 0%, #171E2E 100%)' },
                              { name: 'Teal Horizon', val: 'linear-gradient(135deg, #134E4A 0%, #065F46 100%)' },
                              { name: 'Warm Amber Bronze', val: 'linear-gradient(135deg, #78350F 0%, #451A03 100%)' },
                            ].map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => handleUpdateBlock(activeBlock.id, { bannerGradient: preset.val })}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '6px',
                                  background: preset.val,
                                  color: '#FFFFFF',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  border: (activeBlock.bannerGradient || 'linear-gradient(135deg, #07192F 0%, #0D2C54 50%, #173E73 100%)') === preset.val ? '2px solid #60A5FA' : '1px solid rgba(255,255,255,0.15)',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                  boxShadow: (activeBlock.bannerGradient || 'linear-gradient(135deg, #07192F 0%, #0D2C54 50%, #173E73 100%)') === preset.val ? '0 0 0 2px rgba(96, 165, 250, 0.4)' : 'none',
                                }}
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* SECTION B: Red Text Badge Configuration */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ShieldCheck size={16} color={activeBlock.badgeTextColor || '#FF6B6B'} />
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                                Red Text Badge (Official Seal)
                              </span>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.78rem', color: '#CBD5E1' }}>
                              <input
                                type="checkbox"
                                checked={activeBlock.showBadge !== false}
                                onChange={(e) => handleUpdateBlock(activeBlock.id, { showBadge: e.target.checked })}
                              />
                              <span>Show Badge</span>
                            </label>
                          </div>

                          {activeBlock.showBadge !== false && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.74rem', color: '#94A3B8', marginBottom: '4px' }}>
                                  Badge Text
                                </label>
                                <input
                                  type="text"
                                  value={activeBlock.badgeText ?? 'Official RNP Provisional Curriculum'}
                                  onChange={(e) => handleUpdateBlock(activeBlock.id, { badgeText: e.target.value })}
                                  placeholder="OFFICIAL RNP PROVISIONAL CURRICULUM"
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    backgroundColor: '#0F172A',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    color: activeBlock.badgeTextColor || '#FF6B6B',
                                    fontWeight: 700,
                                    fontSize: '0.84rem',
                                    letterSpacing: '0.05em',
                                  }}
                                />
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.74rem', color: '#94A3B8', marginBottom: '4px' }}>
                                    Badge Text Color
                                  </label>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    {[
                                      { name: 'Red', col: '#FF6B6B' },
                                      { name: 'Coral', col: '#F87171' },
                                      { name: 'Emerald', col: '#34D399' },
                                      { name: 'Sky', col: '#60A5FA' },
                                      { name: 'Amber', col: '#FBBF24' },
                                      { name: 'White', col: '#FFFFFF' },
                                    ].map((c) => (
                                      <div
                                        key={c.name}
                                        title={c.name}
                                        onClick={() => handleUpdateBlock(activeBlock.id, { badgeTextColor: c.col })}
                                        style={{
                                          width: '24px',
                                          height: '24px',
                                          borderRadius: '4px',
                                          backgroundColor: c.col,
                                          border: (activeBlock.badgeTextColor || '#FF6B6B') === c.col ? '2px solid #FFFFFF' : '1px solid #475569',
                                          cursor: 'pointer',
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label style={{ display: 'block', fontSize: '0.74rem', color: '#94A3B8', marginBottom: '4px' }}>
                                    Badge Background Tint
                                  </label>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    {[
                                      { name: 'Red Tint', bg: 'rgba(217, 56, 30, 0.25)', label: 'Red' },
                                      { name: 'Blue Tint', bg: 'rgba(0, 85, 165, 0.25)', label: 'Blue' },
                                      { name: 'Green Tint', bg: 'rgba(5, 135, 40, 0.25)', label: 'Green' },
                                      { name: 'Glass Tint', bg: 'rgba(255, 255, 255, 0.15)', label: 'Glass' },
                                    ].map((b) => (
                                      <button
                                        key={b.name}
                                        type="button"
                                        onClick={() => handleUpdateBlock(activeBlock.id, { badgeBgColor: b.bg })}
                                        style={{
                                          padding: '3px 8px',
                                          borderRadius: '4px',
                                          fontSize: '0.72rem',
                                          backgroundColor: b.bg,
                                          color: '#FFFFFF',
                                          border: (activeBlock.badgeBgColor || 'rgba(217, 56, 30, 0.25)') === b.bg ? '1px solid #60A5FA' : '1px solid rgba(255,255,255,0.1)',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        {b.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* SECTION C: Subtitle & Description */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                            Banner Subtitle / Description
                          </label>
                          <textarea
                            rows={3}
                            value={activeBlock.subtitle ?? activeBlock.content ?? ''}
                            onChange={(e) => handleUpdateBlock(activeBlock.id, { subtitle: e.target.value, content: e.target.value })}
                            placeholder="Master Rwanda driving legislation, roundabout circulation, right-of-way priority..."
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#0F172A',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#FFFFFF',
                              fontSize: '0.88rem',
                              lineHeight: 1.5,
                            }}
                          />
                        </div>

                        {/* SECTION D: Action Buttons Manager */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <BookOpen size={16} color="#60A5FA" />
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                                Action Buttons ({((activeBlock.buttons || []).length)})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newBtn = {
                                  id: `btn-${Date.now()}`,
                                  label: 'New Action',
                                  actionType: 'modules' as const,
                                  style: 'red_primary' as const,
                                };
                                const updatedButtons = [...(activeBlock.buttons || []), newBtn];
                                handleUpdateBlock(activeBlock.id, { buttons: updatedButtons });
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                            >
                              <Plus size={13} />
                              <span>Add Action Button</span>
                            </button>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {((activeBlock.buttons || [])).map((btn, bIdx) => (
                              <div
                                key={btn.id || bIdx}
                                style={{
                                  padding: '12px 14px',
                                  borderRadius: '6px',
                                  backgroundColor: '#0F172A',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#93C5FD' }}>
                                    Button #{bIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = (activeBlock.buttons || []).filter((_, i) => i !== bIdx);
                                      handleUpdateBlock(activeBlock.id, { buttons: updated });
                                    }}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#EF4444',
                                      cursor: 'pointer',
                                      padding: '2px',
                                    }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>
                                      Button Label
                                    </label>
                                    <input
                                      type="text"
                                      value={btn.label}
                                      onChange={(e) => {
                                        const updated = [...(activeBlock.buttons || [])];
                                        updated[bIdx].label = e.target.value;
                                        handleUpdateBlock(activeBlock.id, { buttons: updated });
                                      }}
                                      placeholder="e.g. Go to Modules"
                                      style={{
                                        width: '100%',
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        backgroundColor: '#1E293B',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#FFFFFF',
                                        fontSize: '0.82rem',
                                      }}
                                    />
                                  </div>

                                  <div>
                                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>
                                      Action Target
                                    </label>
                                    <select
                                      value={btn.actionType}
                                      onChange={(e) => {
                                        const updated = [...(activeBlock.buttons || [])];
                                        updated[bIdx].actionType = e.target.value as any;
                                        handleUpdateBlock(activeBlock.id, { buttons: updated });
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: '#1E293B',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#FFFFFF',
                                        fontSize: '0.8rem',
                                      }}
                                    >
                                      <option value="modules">Go to Modules</option>
                                      <option value="live">Live Class Schedule</option>
                                      <option value="announcements">Announcements</option>
                                      <option value="syllabus">Syllabus</option>
                                      <option value="lesson">Specific Lesson</option>
                                      <option value="url">External Link</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>
                                      Color Style
                                    </label>
                                    <select
                                      value={btn.style}
                                      onChange={(e) => {
                                        const updated = [...(activeBlock.buttons || [])];
                                        updated[bIdx].style = e.target.value as any;
                                        handleUpdateBlock(activeBlock.id, { buttons: updated });
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: '#1E293B',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#FFFFFF',
                                        fontSize: '0.8rem',
                                      }}
                                    >
                                      <option value="red_primary">Red Primary (#D9381E)</option>
                                      <option value="blue_primary">Blue Primary (#0055A5)</option>
                                      <option value="glass_outline">Frosted Glass Outline</option>
                                      <option value="white">Solid White</option>
                                    </select>
                                  </div>
                                </div>

                                {btn.actionType === 'url' && (
                                  <div>
                                    <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>
                                      External URL
                                    </label>
                                    <input
                                      type="text"
                                      value={btn.target || ''}
                                      onChange={(e) => {
                                        const updated = [...(activeBlock.buttons || [])];
                                        updated[bIdx].target = e.target.value;
                                        handleUpdateBlock(activeBlock.id, { buttons: updated });
                                      }}
                                      placeholder="https://example.com"
                                      style={{
                                        width: '100%',
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        backgroundColor: '#1E293B',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#FFFFFF',
                                        fontSize: '0.82rem',
                                      }}
                                    />
                                  </div>
                                )}

                                {btn.actionType === 'lesson' && (
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                                      <label style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                                        Select Target Lesson
                                      </label>
                                      {isLoadingCurriculum && (
                                        <span style={{ fontSize: '0.68rem', color: '#38BDF8' }}>Loading...</span>
                                      )}
                                    </div>
                                    <select
                                      value={btn.target || ''}
                                      onChange={(e) => {
                                        const updated = [...(activeBlock.buttons || [])];
                                        updated[bIdx].target = e.target.value;
                                        handleUpdateBlock(activeBlock.id, { buttons: updated });
                                      }}
                                      style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: '#1E293B',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#FFFFFF',
                                        fontSize: '0.8rem',
                                      }}
                                    >
                                      <option value="">{isLoadingCurriculum ? '-- Loading lessons... --' : '-- Choose Lesson --'}</option>
                                      {allLessons.map((l: any) => (
                                        <option key={l.id} value={l.id}>
                                          [{l.moduleTitle}] {l.title}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SECTION E: Road Graphics & Passing Rate Cards Customization */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Compass size={16} color="#60A5FA" />
                              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>
                                Road Graphics & Quick Feature Cards Panel
                              </span>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.78rem', color: '#CBD5E1' }}>
                              <input
                                type="checkbox"
                                checked={activeBlock.showStats !== false}
                                onChange={(e) => handleUpdateBlock(activeBlock.id, { showStats: e.target.checked })}
                              />
                              <span>Enable Right Panel</span>
                            </label>
                          </div>

                          {activeBlock.showStats !== false && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                              {/* Card 1: Priority Badge Card */}
                              <div
                                style={{
                                  padding: '12px',
                                  borderRadius: '6px',
                                  backgroundColor: '#0F172A',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#F87171' }}>
                                    CARD 1: REGULATORY PRIORITY CARD
                                  </span>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.74rem', color: '#94A3B8' }}>
                                    <input
                                      type="checkbox"
                                      checked={activeBlock.showHeroCard1 !== false}
                                      onChange={(e) => handleUpdateBlock(activeBlock.id, { showHeroCard1: e.target.checked })}
                                    />
                                    <span>Visible</span>
                                  </label>
                                </div>
                                {activeBlock.showHeroCard1 !== false && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1.2fr 1.5fr', gap: '8px' }}>
                                    <div>
                                      <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>Badge</label>
                                      <input
                                        type="text"
                                        value={activeBlock.heroCard1Badge ?? 'STOP'}
                                        onChange={(e) => handleUpdateBlock(activeBlock.id, { heroCard1Badge: e.target.value })}
                                        placeholder="STOP"
                                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 800 }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>Card Title</label>
                                      <input
                                        type="text"
                                        value={activeBlock.heroCard1Title ?? 'Regulatory Priority'}
                                        onChange={(e) => handleUpdateBlock(activeBlock.id, { heroCard1Title: e.target.value })}
                                        placeholder="Regulatory Priority"
                                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.8rem' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>Card Subtitle</label>
                                      <input
                                        type="text"
                                        value={activeBlock.heroCard1Subtitle ?? 'Article 34 - Full stop & yield'}
                                        onChange={(e) => handleUpdateBlock(activeBlock.id, { heroCard1Subtitle: e.target.value })}
                                        placeholder="Article 34 - Full stop & yield"
                                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.8rem' }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Card 2: Navigation / Topic Card */}
                              <div
                                style={{
                                  padding: '12px',
                                  borderRadius: '6px',
                                  backgroundColor: '#0F172A',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#60A5FA' }}>
                                    CARD 2: NAVIGATION & TOPIC CARD
                                  </span>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.74rem', color: '#94A3B8' }}>
                                    <input
                                      type="checkbox"
                                      checked={activeBlock.showHeroCard2 !== false}
                                      onChange={(e) => handleUpdateBlock(activeBlock.id, { showHeroCard2: e.target.checked })}
                                    />
                                    <span>Visible</span>
                                  </label>
                                </div>
                                {activeBlock.showHeroCard2 !== false && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '110px 1.2fr 1.5fr', gap: '8px' }}>
                                    <div>
                                      <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>Icon</label>
                                      <select
                                        value={activeBlock.heroCard2Icon || 'compass'}
                                        onChange={(e) => handleUpdateBlock(activeBlock.id, { heroCard2Icon: e.target.value as any })}
                                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.8rem' }}
                                      >
                                        <option value="compass">Compass</option>
                                        <option value="shield">Shield</option>
                                        <option value="check">Checkmark</option>
                                        <option value="star">Star</option>
                                        <option value="car">Layers</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>Card Title</label>
                                      <input
                                        type="text"
                                        value={activeBlock.heroCard2Title ?? 'Roundabout Circulation'}
                                        onChange={(e) => handleUpdateBlock(activeBlock.id, { heroCard2Title: e.target.value })}
                                        placeholder="Roundabout Circulation"
                                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.8rem' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>Card Subtitle</label>
                                      <input
                                        type="text"
                                        value={activeBlock.heroCard2Subtitle ?? 'Priority to circulating traffic'}
                                        onChange={(e) => handleUpdateBlock(activeBlock.id, { heroCard2Subtitle: e.target.value })}
                                        placeholder="Priority to circulating traffic"
                                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.8rem' }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Card 3: Target Passing Rate Card */}
                              <div
                                style={{
                                  padding: '12px',
                                  borderRadius: '6px',
                                  backgroundColor: '#0F172A',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#86EFAC' }}>
                                    CARD 3: TARGET PASSING RATE / SCORE BADGE
                                  </span>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.74rem', color: '#94A3B8' }}>
                                    <input
                                      type="checkbox"
                                      checked={activeBlock.showHeroPassingRate !== false}
                                      onChange={(e) => handleUpdateBlock(activeBlock.id, { showHeroPassingRate: e.target.checked })}
                                    />
                                    <span>Visible</span>
                                  </label>
                                </div>
                                {activeBlock.showHeroPassingRate !== false && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <div>
                                      <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>Badge Label</label>
                                      <input
                                        type="text"
                                        value={activeBlock.heroPassingRateLabel ?? 'RNP Passing Rate'}
                                        onChange={(e) => handleUpdateBlock(activeBlock.id, { heroPassingRateLabel: e.target.value })}
                                        placeholder="RNP Passing Rate"
                                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.8rem' }}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>Score / Requirement Value</label>
                                      <input
                                        type="text"
                                        value={activeBlock.heroPassingRateValue ?? '88% Minimum (18/20)'}
                                        onChange={(e) => handleUpdateBlock(activeBlock.id, { heroPassingRateValue: e.target.value })}
                                        placeholder="88% Minimum (18/20)"
                                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 700 }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Card 4: Stats Summary Bar */}
                              <div
                                style={{
                                  padding: '12px',
                                  borderRadius: '6px',
                                  backgroundColor: '#0F172A',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#E2E8F0' }}>
                                    STATS SUMMARY BAR
                                  </span>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.74rem', color: '#94A3B8' }}>
                                    <input
                                      type="checkbox"
                                      checked={activeBlock.showHeroStatsSummary !== false}
                                      onChange={(e) => handleUpdateBlock(activeBlock.id, { showHeroStatsSummary: e.target.checked })}
                                    />
                                    <span>Visible</span>
                                  </label>
                                </div>
                                {activeBlock.showHeroStatsSummary !== false && (
                                  <div>
                                    <label style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>
                                      Custom Summary Note (leave empty for automatic Modules • Lessons • Study Hours)
                                    </label>
                                    <input
                                      type="text"
                                      value={activeBlock.heroStatsSummaryText || ''}
                                      onChange={(e) => handleUpdateBlock(activeBlock.id, { heroStatsSummaryText: e.target.value })}
                                      placeholder="e.g. 5 Modules • 24 Lessons • ~12 Study Hrs"
                                      style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '0.8rem' }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ------------------------------------------------ */}
                    {/* TEXT BLOCK CONTROLS (Bold, Italic, Font, Size, Color) */}
                    {/* ------------------------------------------------ */}
                    {activeBlock.type === 'text' && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          padding: '18px',
                          borderRadius: '8px',
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94A3B8' }}>
                          RICH TEXT FORMATTING TOOLBAR
                        </span>

                        {/* Toolbar row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {/* Bold */}
                          <button
                            type="button"
                            onClick={() => handleUpdateBlock(activeBlock.id, { isBold: !activeBlock.isBold })}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: activeBlock.isBold ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                              backgroundColor: activeBlock.isBold ? '#2563EB' : '#0F172A',
                              color: '#FFFFFF',
                              fontWeight: 900,
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                            }}
                          >
                            B
                          </button>

                          {/* Italic */}
                          <button
                            type="button"
                            onClick={() => handleUpdateBlock(activeBlock.id, { isItalic: !activeBlock.isItalic })}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: activeBlock.isItalic ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                              backgroundColor: activeBlock.isItalic ? '#2563EB' : '#0F172A',
                              color: '#FFFFFF',
                              fontStyle: 'italic',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                            }}
                          >
                            I
                          </button>

                          {/* Underline */}
                          <button
                            type="button"
                            onClick={() => handleUpdateBlock(activeBlock.id, { isUnderline: !activeBlock.isUnderline })}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: activeBlock.isUnderline ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                              backgroundColor: activeBlock.isUnderline ? '#2563EB' : '#0F172A',
                              color: '#FFFFFF',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                            }}
                          >
                            U
                          </button>

                          {/* Font Family selector */}
                          <select
                            value={activeBlock.fontFamily || 'Inter, sans-serif'}
                            onChange={(e) => handleUpdateBlock(activeBlock.id, { fontFamily: e.target.value })}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              backgroundColor: '#0F172A',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#FFFFFF',
                              fontSize: '0.8rem',
                            }}
                          >
                            <option value="Inter, sans-serif">Modern Sans (Inter)</option>
                            <option value="Outfit, sans-serif">Clean Display (Outfit)</option>
                            <option value="Georgia, serif">Classic Serif</option>
                            <option value="monospace">Technical Monospace</option>
                            <option value="Roboto, sans-serif">Standard (Roboto)</option>
                          </select>

                          {/* Font Size selector */}
                          <select
                            value={activeBlock.fontSize || 15}
                            onChange={(e) => handleUpdateBlock(activeBlock.id, { fontSize: Number(e.target.value) })}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              backgroundColor: '#0F172A',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#FFFFFF',
                              fontSize: '0.8rem',
                            }}
                          >
                            <option value={30}>Heading 1 (30px)</option>
                            <option value={24}>Heading 2 (24px)</option>
                            <option value={19}>Heading 3 (19px)</option>
                            <option value={16}>Body Large (16px)</option>
                            <option value={14}>Body Regular (14px)</option>
                            <option value={12}>Small Note (12px)</option>
                          </select>

                          {/* Text Align */}
                          <button
                            type="button"
                            onClick={() => handleUpdateBlock(activeBlock.id, { textAlign: 'left' })}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              backgroundColor: activeBlock.textAlign === 'left' ? '#2563EB' : '#0F172A',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#FFFFFF',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            Left
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateBlock(activeBlock.id, { textAlign: 'center' })}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              backgroundColor: activeBlock.textAlign === 'center' ? '#2563EB' : '#0F172A',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#FFFFFF',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            Center
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateBlock(activeBlock.id, { textAlign: 'right' })}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              backgroundColor: activeBlock.textAlign === 'right' ? '#2563EB' : '#0F172A',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#FFFFFF',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            Right
                          </button>
                        </div>

                        {/* Text Color & Callout Style */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                          <div>
                            <label style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                              Text Color
                            </label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {['#1E293B', '#0055A5', '#059669', '#DC2626', '#7C3AED', '#D97706', '#FFFFFF'].map((col) => (
                                <div
                                  key={col}
                                  onClick={() => handleUpdateBlock(activeBlock.id, { textColor: col })}
                                  style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '4px',
                                    backgroundColor: col,
                                    border: activeBlock.textColor === col ? '2px solid #60A5FA' : '1px solid #475569',
                                    cursor: 'pointer',
                                  }}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.74rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                              Callout Container
                            </label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {[
                                { name: 'None', bg: '' },
                                { name: 'Blue Note', bg: 'rgba(59, 130, 246, 0.08)' },
                                { name: 'Green Tip', bg: 'rgba(16, 185, 129, 0.08)' },
                                { name: 'Amber Notice', bg: 'rgba(245, 158, 11, 0.08)' },
                              ].map((opt) => (
                                <button
                                  key={opt.name}
                                  type="button"
                                  onClick={() => handleUpdateBlock(activeBlock.id, { bgColor: opt.bg })}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.74rem',
                                    border: activeBlock.bgColor === opt.bg ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.1)',
                                    backgroundColor: activeBlock.bgColor === opt.bg ? '#2563EB' : '#0F172A',
                                    color: '#FFFFFF',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {opt.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Content Textarea */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                            Paragraph / Markdown Content
                          </label>
                          <textarea
                            rows={6}
                            value={activeBlock.content || ''}
                            onChange={(e) => handleUpdateBlock(activeBlock.id, { content: e.target.value })}
                            placeholder="Write your text content here..."
                            style={{
                              width: '100%',
                              padding: '12px 14px',
                              borderRadius: '6px',
                              backgroundColor: '#0F172A',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#FFFFFF',
                              fontSize: '0.9rem',
                              fontFamily: activeBlock.fontFamily || 'inherit',
                              lineHeight: 1.6,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* ------------------------------------------------ */}
                    {/* IMAGE BLOCK CONTROLS (Insert, Resize, Crop) */}
                    {/* ------------------------------------------------ */}
                    {activeBlock.type === 'image' && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          padding: '18px',
                          borderRadius: '8px',
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94A3B8' }}>
                          IMAGE INSERTION, RESIZING & CROPPING CONTROLS
                        </span>

                        {/* Image Source (URL or File Upload) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8' }}>
                            Image URL or Upload File
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              value={activeBlock.imageUrl || ''}
                              onChange={(e) => handleUpdateBlock(activeBlock.id, { imageUrl: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '6px',
                                backgroundColor: '#0F172A',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: '#FFFFFF',
                                fontSize: '0.84rem',
                              }}
                            />
                            <label
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '6px',
                                backgroundColor: '#2563EB',
                                color: '#FFFFFF',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <Upload size={14} />
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleImageUpload(activeBlock.id, f);
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* RESIZING TOOL: Width Presets & Slider */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8' }}>
                              Resize Width: <strong style={{ color: '#60A5FA' }}>{activeBlock.imageWidth || 100}%</strong>
                            </label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {[25, 50, 75, 100].map((w) => (
                                <button
                                  key={w}
                                  type="button"
                                  onClick={() => handleUpdateBlock(activeBlock.id, { imageWidth: w })}
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    border: 'none',
                                    backgroundColor: activeBlock.imageWidth === w ? '#2563EB' : '#0F172A',
                                    color: '#FFFFFF',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {w}%
                                </button>
                              ))}
                            </div>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            step="5"
                            value={activeBlock.imageWidth || 100}
                            onChange={(e) => handleUpdateBlock(activeBlock.id, { imageWidth: Number(e.target.value) })}
                            style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer' }}
                          />
                        </div>

                        {/* CROPPING TOOL: Aspect Ratio & Framing */}
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '8px' }}>
                            Crop & Aspect Ratio Preset
                          </label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {[
                              { label: '16:9 Banner', ratio: '16:9' },
                              { label: '4:3 Presentation', ratio: '4:3' },
                              { label: '1:1 Square', ratio: '1:1' },
                              { label: 'Circle (Round)', ratio: 'round' },
                              { label: 'Free / Original', ratio: 'free' },
                            ].map((cr) => (
                              <button
                                key={cr.ratio}
                                type="button"
                                onClick={() => handleUpdateBlock(activeBlock.id, { imageCropRatio: cr.ratio as any })}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  backgroundColor: activeBlock.imageCropRatio === cr.ratio ? '#2563EB' : '#0F172A',
                                  border: activeBlock.imageCropRatio === cr.ratio ? '1px solid #60A5FA' : '1px solid rgba(255,255,255,0.1)',
                                  color: '#FFFFFF',
                                  cursor: 'pointer',
                                }}
                              >
                                <Crop size={12} />
                                <span>{cr.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Alignment & Caption */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                              Alignment
                            </label>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {(['left', 'center', 'right'] as const).map((al) => (
                                <button
                                  key={al}
                                  type="button"
                                  onClick={() => handleUpdateBlock(activeBlock.id, { textAlign: al })}
                                  style={{
                                    flex: 1,
                                    padding: '6px',
                                    borderRadius: '4px',
                                    fontSize: '0.76rem',
                                    backgroundColor: (activeBlock.textAlign || 'center') === al ? '#2563EB' : '#0F172A',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#FFFFFF',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {al.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                              Image Caption / Legend
                            </label>
                            <input
                              type="text"
                              value={activeBlock.imageCaption || ''}
                              onChange={(e) => handleUpdateBlock(activeBlock.id, { imageCaption: e.target.value })}
                              placeholder="e.g. Figure 1: Major Kigali roundabout priority chart"
                              style={{
                                width: '100%',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                backgroundColor: '#0F172A',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: '#FFFFFF',
                                fontSize: '0.82rem',
                              }}
                            />
                          </div>
                        </div>

                        {/* Visual Image Preview in Editor */}
                        {activeBlock.imageUrl && (
                          <div style={{ marginTop: '10px', padding: '12px', backgroundColor: '#0F172A', borderRadius: '6px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '8px' }}>
                              Live Image Preview:
                            </span>
                            <div
                              style={{
                                width: `${activeBlock.imageWidth || 100}%`,
                                margin: '0 auto',
                                borderRadius: activeBlock.imageCropRatio === 'round' ? '50%' : '6px',
                                overflow: 'hidden',
                                aspectRatio:
                                  activeBlock.imageCropRatio === '16:9'
                                    ? '16 / 9'
                                    : activeBlock.imageCropRatio === '4:3'
                                    ? '4 / 3'
                                    : activeBlock.imageCropRatio === '1:1' || activeBlock.imageCropRatio === 'round'
                                    ? '1 / 1'
                                    : 'auto',
                                maxHeight: '220px',
                              }}
                            >
                              <img
                                src={activeBlock.imageUrl}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ------------------------------------------------ */}
                    {/* MODULE ATTACHMENT CONTROLS */}
                    {/* ------------------------------------------------ */}
                    {activeBlock.type === 'module_attach' && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          padding: '18px',
                          borderRadius: '8px',
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94A3B8' }}>
                          ATTACH COURSE MODULE
                        </span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8' }}>
                              Select Module from This Course
                            </label>
                            {isLoadingCurriculum && (
                              <span style={{ fontSize: '0.72rem', color: '#38BDF8' }}>Loading modules...</span>
                            )}
                          </div>
                          <select
                            value={activeBlock.moduleId || ''}
                            onChange={(e) => {
                              const chosen = modules.find((m: any) => m.id === e.target.value);
                              handleUpdateBlock(activeBlock.id, {
                                moduleId: e.target.value,
                                title: chosen ? chosen.title : activeBlock.title,
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#0F172A',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#FFFFFF',
                              fontSize: '0.88rem',
                            }}
                          >
                            <option value="">{isLoadingCurriculum ? '-- Loading modules... --' : '-- Choose Module --'}</option>
                            {modules.map((m: any, mIdx: number) => (
                              <option key={m.id} value={m.id}>
                                Module {mIdx + 1}: {m.title} ({m.lessons?.length || 0} Lessons)
                              </option>
                            ))}
                          </select>
                          {!isLoadingCurriculum && modules.length === 0 && (
                            <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#EF4444' }}>
                              No modules found in this course. Create modules in the course studio first.
                            </p>
                          )}
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                            Module Card Guidance Note
                          </label>
                          <textarea
                            rows={3}
                            value={activeBlock.content || ''}
                            onChange={(e) => handleUpdateBlock(activeBlock.id, { content: e.target.value })}
                            placeholder="Add brief guidance or why students should complete this module..."
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#0F172A',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#FFFFFF',
                              fontSize: '0.84rem',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* ------------------------------------------------ */}
                    {/* LESSON ATTACHMENT CONTROLS */}
                    {/* ------------------------------------------------ */}
                    {activeBlock.type === 'lesson_attach' && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          padding: '18px',
                          borderRadius: '8px',
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94A3B8' }}>
                          ATTACH SPECIFIC LESSON MATERIAL
                        </span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8' }}>
                              Select Lesson from Course
                            </label>
                            {isLoadingCurriculum && (
                              <span style={{ fontSize: '0.72rem', color: '#38BDF8' }}>Loading lessons...</span>
                            )}
                          </div>
                          <select
                            value={activeBlock.lessonId || ''}
                            onChange={(e) => {
                              const chosen = allLessons.find((l: any) => l.id === e.target.value);
                              handleUpdateBlock(activeBlock.id, {
                                lessonId: e.target.value,
                                lessonTitle: chosen ? chosen.title : activeBlock.title,
                                lessonDuration: chosen?.durationMinutes || 15,
                                title: chosen ? chosen.title : activeBlock.title,
                              });
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#0F172A',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#FFFFFF',
                              fontSize: '0.88rem',
                            }}
                          >
                            <option value="">{isLoadingCurriculum ? '-- Loading lessons... --' : '-- Choose Lesson --'}</option>
                            {allLessons.map((l: any) => (
                              <option key={l.id} value={l.id}>
                                [{l.moduleTitle}] {l.title} (~{l.durationMinutes || 15} min)
                              </option>
                            ))}
                          </select>
                          {!isLoadingCurriculum && allLessons.length === 0 && (
                            <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#EF4444' }}>
                              No lessons found in this course. Add lessons to your modules first.
                            </p>
                          )}
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                            Featured Lesson Note
                          </label>
                          <input
                            type="text"
                            value={activeBlock.content || ''}
                            onChange={(e) => handleUpdateBlock(activeBlock.id, { content: e.target.value })}
                            placeholder="e.g. Essential reading before attempting quiz 1"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#0F172A',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#FFFFFF',
                              fontSize: '0.84rem',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* ------------------------------------------------ */}
                    {/* RESOURCE LINKS CONTROLS */}
                    {/* ------------------------------------------------ */}
                    {activeBlock.type === 'resources' && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          padding: '18px',
                          borderRadius: '8px',
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94A3B8' }}>
                          ATTACH EXTERNAL & SLIDE PRESENTATION LINKS
                        </span>
                        {(activeBlock.links || []).map((link, lIdx) => (
                          <div
                            key={lIdx}
                            style={{
                              padding: '12px',
                              borderRadius: '6px',
                              backgroundColor: '#0F172A',
                              border: '1px solid rgba(255,255,255,0.06)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder="Resource Title (e.g. Canva Presentation)"
                                value={link.title}
                                onChange={(e) => {
                                  const updated = [...(activeBlock.links || [])];
                                  updated[lIdx].title = e.target.value;
                                  handleUpdateBlock(activeBlock.id, { links: updated });
                                }}
                                style={{
                                  flex: 1,
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  backgroundColor: '#1E293B',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  color: '#FFFFFF',
                                  fontSize: '0.82rem',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (activeBlock.links || []).filter((_, i) => i !== lIdx);
                                  handleUpdateBlock(activeBlock.id, { links: updated });
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#EF4444',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="URL (e.g. https://www.canva.com/design/...)"
                              value={link.url}
                              onChange={(e) => {
                                const updated = [...(activeBlock.links || [])];
                                updated[lIdx].url = e.target.value;
                                handleUpdateBlock(activeBlock.id, { links: updated });
                              }}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                backgroundColor: '#1E293B',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#FFFFFF',
                                fontSize: '0.82rem',
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Short Description"
                              value={link.description || ''}
                              onChange={(e) => {
                                const updated = [...(activeBlock.links || [])];
                                updated[lIdx].description = e.target.value;
                                handleUpdateBlock(activeBlock.id, { links: updated });
                              }}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                borderRadius: '4px',
                                backgroundColor: '#1E293B',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#FFFFFF',
                                fontSize: '0.82rem',
                              }}
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const updated = [
                              ...(activeBlock.links || []),
                              { title: 'New Resource', url: 'https://', description: '' },
                            ];
                            handleUpdateBlock(activeBlock.id, { links: updated });
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ alignSelf: 'flex-start' }}
                        >
                          <Plus size={13} />
                          <span>Add Link</span>
                        </button>
                      </div>
                    )}

                    {/* ------------------------------------------------ */}
                    {/* OUTCOMES CHECKLIST CONTROLS */}
                    {/* ------------------------------------------------ */}
                    {activeBlock.type === 'outcomes' && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          padding: '18px',
                          borderRadius: '8px',
                          backgroundColor: '#1E293B',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94A3B8' }}>
                          COURSE OUTCOMES & HIGHLIGHTS CHECKLIST
                        </span>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8' }}>
                          Enter one learning outcome per line. Checkmarks will be rendered automatically.
                        </p>
                        <textarea
                          rows={6}
                          value={activeBlock.content || ''}
                          onChange={(e) => handleUpdateBlock(activeBlock.id, { content: e.target.value })}
                          placeholder="• Outcome 1&#10;• Outcome 2&#10;• Outcome 3"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#0F172A',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: '#FFFFFF',
                            fontSize: '0.88rem',
                            lineHeight: 1.6,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', textAlign: 'center' }}>
                    <Type size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <h4 style={{ margin: '0 0 6px', color: '#FFFFFF' }}>Select a Block to Edit</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', maxWidth: '300px' }}>
                      Click any block in the structure list or insert a new one from the palette above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* MODE 2 & 3: PREVIEW MODE (STUDENT & TUTOR DASHBOARDS) */}
          {/* ============================================================= */}
          {(activeMode === 'student_preview' || activeMode === 'tutor_preview') && (
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                backgroundColor: '#F8FAFC',
                padding: '32px 40px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '1000px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #E2E8F0',
                  padding: '36px 44px',
                }}
              >
                {/* Preview Navigation Banner */}
                <div
                  style={{
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '2px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        backgroundColor: activeMode === 'student_preview' ? '#DBEAFE' : '#EDE9FE',
                        color: activeMode === 'student_preview' ? '#1E40AF' : '#6D28D9',
                      }}
                    >
                      {activeMode === 'student_preview'
                        ? 'STUDENT DASHBOARD PREVIEW'
                        : 'TUTOR DASHBOARD PREVIEW'}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Previewing how learners & tutors experience this course home page.
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveMode('editor')}
                    className="canvas-btn canvas-btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Edit3 size={13} />
                    <span>Back to Editor</span>
                  </button>
                </div>

                {/* Render the home page components */}
                <RenderCourseHomepage
                  course={{ ...course, modules }}
                  homepageData={homepageData}
                  role={activeMode === 'student_preview' ? 'STUDENT' : 'TUTOR'}
                  isPreview={true}
                  onNavigateTab={(tab) => {
                    success(`Preview navigation clicked: ${tab}`);
                  }}
                  onOpenLesson={(lesId) => {
                    success(`Preview lesson open: ${lesId}`);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
