const { Project, SyntaxKind } = require("ts-morph");

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const diagnostics = project.getPreEmitDiagnostics();
let fixed = 0;

for (const diagnostic of diagnostics) {
    const code = diagnostic.getCode();
    if (code === 6133 || code === 6198) {
        const file = diagnostic.getSourceFile();
        if (file) {
            const start = diagnostic.getStart();
            if (start !== undefined) {
                const node = file.getDescendantAtPos(start);
                if (node) {
                    try {
                        const importSpecifier = node.getFirstAncestorByKind(SyntaxKind.ImportSpecifier);
                        if (importSpecifier) {
                            importSpecifier.remove();
                            fixed++;
                            continue;
                        }

                        const importClause = node.getFirstAncestorByKind(SyntaxKind.ImportClause);
                        if (importClause && importClause.getDefaultImport() === node) {
                            const parent = importClause.getParent();
                            if (parent && parent.getKind() === SyntaxKind.ImportDeclaration) {
                                parent.remove();
                            } else {
                                importClause.getDefaultImport().remove();
                            }
                            fixed++;
                            continue;
                        }

                        const bindingElement = node.getFirstAncestorByKind(SyntaxKind.BindingElement);
                        if (bindingElement) {
                            bindingElement.remove();
                            fixed++;
                            continue;
                        }

                        const varDecl = node.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
                        if (varDecl) {
                            const varStatement = varDecl.getFirstAncestorByKind(SyntaxKind.VariableStatement);
                            if (varStatement) {
                                if (varStatement.getDeclarations().length === 1) {
                                    varStatement.remove();
                                } else {
                                    varDecl.remove();
                                }
                            } else {
                                varDecl.remove();
                            }
                            fixed++;
                            continue;
                        }

                        const param = node.getFirstAncestorByKind(SyntaxKind.Parameter);
                        if (param) {
                            if (!param.getName().startsWith('_')) {
                                param.rename(`_${param.getName()}`);
                                fixed++;
                            }
                            continue;
                        }
                    } catch (e) {
                    }
                }
            }
        }
    }
}

project.saveSync();
console.log(`Fixed ${fixed} unused items.`);
