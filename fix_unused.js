const fs = require('fs');
function removeUnused(file, search, replace) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
}

// OnboardingChecklist
removeUnused('components/dashboard/OnboardingChecklist.tsx', /const \{ Icon \}= step;/g, '');

// PaceCalculator
removeUnused('components/dashboard/PaceCalculator.tsx', /Timer, /g, '');
removeUnused('components/dashboard/PaceCalculator.tsx', /import \{ cn \} from "@\/lib\/utils";/g, '');
removeUnused('components/dashboard/PaceCalculator.tsx', /const \[mode, setMode\] = useState<"calculator" \| "reference">("calculator");/g, '');

// PlanEditor
removeUnused('components/dashboard/PlanEditor.tsx', /Waves, /g, '');
removeUnused('components/dashboard/PlanEditor.tsx', /Info, /g, '');
removeUnused('components/dashboard/PlanEditor.tsx', /Clock, /g, '');
removeUnused('components/dashboard/PlanEditor.tsx', /const \[isAnalyzing, setIsAnalyzing\] = useState\(false\);/g, 'const [isAnalyzing] = useState(false);');
removeUnused('components/dashboard/PlanEditor.tsx', /const \[aiAnalysis, setAiAnalysis\] = useState<any>\(null\);/g, 'const [aiAnalysis] = useState<any>(null);');
removeUnused('components/dashboard/PlanEditor.tsx', /const addBlock = \(type: "warmup" \| "main" \| "cooldown"\) => \{[\s\S]*?\};/g, '');
removeUnused('components/dashboard/PlanEditor.tsx', /\(bIndex: number\)/g, '()');
removeUnused('components/dashboard/PlanEditor.tsx', /\(bIndex: number, iIndex: number\)/g, '()');

// PlanModuleEditor
removeUnused('components/dashboard/PlanModuleEditor.tsx', /import \{ BlockTemplate \} from "@\/types";/g, '');
removeUnused('components/dashboard/PlanModuleEditor.tsx', /Clock, /g, '');

// RecentPerformances
removeUnused('components/dashboard/RecentPerformances.tsx', /Clock, /g, '');
removeUnused('components/dashboard/RecentPerformances.tsx', /const \{ t \} = useLanguage\(\);/g, '');

// TeamFeedbackSummary
removeUnused('components/dashboard/TeamFeedbackSummary.tsx', /getLocalDateISOString, /g, '');

// TeamStatsPanel
removeUnused('components/dashboard/TeamStatsPanel.tsx', /Trophy, /g, '');
removeUnused('components/dashboard/TeamStatsPanel.tsx', /const activeCount = /g, 'const _activeCount = ');
removeUnused('components/dashboard/TeamStatsPanel.tsx', /const pbCount = /g, 'const _pbCount = ');

// WorkoutLibrary
removeUnused('components/dashboard/WorkoutLibrary.tsx', /BookOpen, /g, '');

// AnnouncementCard
removeUnused('components/feed/AnnouncementCard.tsx', /ExternalLink /g, '');

// PhotoUpload
removeUnused('components/plan/PhotoUpload.tsx', /Image as ImageIcon, /g, '');
removeUnused('components/plan/PhotoUpload.tsx', /Loader2 /g, '');

// useBackgroundTheme
removeUnused('hooks/useBackgroundTheme.ts', /getThemePreference, /g, '');

// prisma
removeUnused('lib/prisma.ts', /import \{ Pool, neonConfig \} from '@neondatabase\/serverless';/g, 'import { neonConfig } from "@neondatabase/serverless";');
removeUnused('lib/prisma.ts', /import \{ PrismaNeon \} from '@prisma\/adapter-neon';/g, '');
removeUnused('lib/prisma.ts', /\(target: any, prop, receiver\)/g, '(_target: any, prop, receiver)');
removeUnused('lib/prisma.ts', /\(target: any, thisArg: any, args: any\[\]\)/g, '(_target: any, _thisArg: any, _args: any[])');

// store
removeUnused('lib/store.tsx', /persistAll, /g, '');

// entity-crud
removeUnused('lib/store/entity-crud.ts', /plans, /g, '');
removeUnused('lib/store/entity-crud.ts', /feedbacks, /g, '');
removeUnused('lib/store/entity-crud.ts', /announcements, /g, '');
removeUnused('lib/store/entity-crud.ts', /archivedAnnouncements, /g, '');

