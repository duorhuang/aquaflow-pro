const fs = require('fs');
function removeUnused(file, search, replace) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
}

// AttendanceCalendar
removeUnused('components/athlete/AttendanceCalendar.tsx', /import React, \{ useState \} from "react";/g, 'import React from "react";');

// AvatarRenderer
removeUnused('components/athlete/AvatarRenderer.tsx', /import React, \{ useMemo/g, 'import { useMemo');

// BackgroundPicker
removeUnused('components/athlete/BackgroundPicker.tsx', /useState, useEffect /g, 'useState ');
removeUnused('components/athlete/BackgroundPicker.tsx', /saveThemePreference, /g, '');
removeUnused('components/athlete/BackgroundPicker.tsx', /const \{ currentMode, applyTheme \}/g, 'const { applyTheme }');

// BlockFeedbackPanel
removeUnused('components/athlete/BlockFeedbackPanel.tsx', /blockName, /g, '');

// ShopAndCloset
removeUnused('components/athlete/ShopAndCloset.tsx', /const \{ equippedItems \} = swimmer \|\| \{\};\n/g, '');

// AIInsight
removeUnused('components/dashboard/AIInsight.tsx', /const hasEquipment = [^\n]*\n/g, '');

// AttendanceStats
removeUnused('components/dashboard/AttendanceStats.tsx', /const currentYear = today\.getFullYear\(\);\n/g, '');

// PaceCalculator
removeUnused('components/dashboard/PaceCalculator.tsx', /const \[mode, setMode\] = useState<"calculator" \| "reference">("calculator");/g, '');
removeUnused('components/dashboard/PaceCalculator.tsx', /mode/g, '""');

// PlanEditor
removeUnused('components/dashboard/PlanEditor.tsx', /const \[aiAnalysis, setAiAnalysis\] = useState<any>\(null\);/g, 'const [aiAnalysis] = useState<any>(null);');
removeUnused('components/dashboard/PlanEditor.tsx', /const addBlock = [^\n]*\n/g, '');

// TeamStatsPanel
removeUnused('components/dashboard/TeamStatsPanel.tsx', /const _activeCount/g, 'const activeCount');
removeUnused('components/dashboard/TeamStatsPanel.tsx', /const _pbCount/g, 'const pbCount');

// PhotoUpload
removeUnused('components/plan/PhotoUpload.tsx', /Image as ImageIcon, Loader2/g, '');
