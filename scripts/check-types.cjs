const ts = require('typescript');
const path = require('path');

const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
if (!configPath) {
    console.error("❌ Could not find tsconfig.json");
    process.exit(1);
}

const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, process.cwd());
parsedConfig.options.noEmit = true;

const targetFiles = process.argv.slice(2);
const filesToCheck = targetFiles.length > 0 
    ? targetFiles.map(f => path.resolve(process.cwd(), f))
    : [
        'app/api/auth/login/route.ts',
        'app/api/auth/me/route.ts',
        'app/api/plans/route.ts',
        'app/api/feedbacks/route.ts',
        'components/athlete/LoginForm.tsx',
        'components/dashboard/AIInsight.tsx',
        'components/dashboard/AthletesFeedbackPanel.tsx',
        'components/dashboard/PlanEditor.tsx',
        'components/dashboard/PlanModuleEditor.tsx',
        'types/index.ts',
        'scripts/verify-full-system.ts'
    ].map(f => path.resolve(process.cwd(), f));

console.log(`🔍 Checking TypeScript types for ${filesToCheck.length} target files...`);

const program = ts.createProgram(filesToCheck, parsedConfig.options);
const emitResult = program.emit();
const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

let errorCount = 0;
for (const diag of allDiagnostics) {
    if (diag.category === ts.DiagnosticCategory.Error) {
        errorCount++;
        const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
        if (diag.file) {
            const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
            console.error(`❌ ${path.relative(process.cwd(), diag.file.fileName)} (${line + 1},${character + 1}): ${message}`);
        } else {
            console.error(`❌ ${message}`);
        }
    }
}

if (errorCount === 0) {
    console.log(`✅ All target files passed TypeScript typecheck with 0 errors!`);
    process.exit(0);
} else {
    console.error(`💥 Found ${errorCount} TypeScript errors!`);
    process.exit(1);
}
