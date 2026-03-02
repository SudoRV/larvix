export function ArtifactTypeFromLang(lang) {
    if (!lang) {
        return { type: "document", format: "markdown" };
    }

    const normalized = normalizeLang(lang);

    const diagramLangs = new Set(["mermaid", "plantuml", "dot"]);
    if (diagramLangs.has(normalized)) {
        return { type: "diagram", format: normalized };
    }

    const codeLangs = new Set([
        "javascript", "typescript", "python", "java",
        "c", "cpp", "csharp", "go", "rust",
        "php", "ruby", "swift", "kotlin",
        "bash", "sql", "html", "css", "json", "yaml"
    ]);

    if (codeLangs.has(normalized)) {
        return { type: "code", language: normalized };
    }

    if (normalized === "markdown" || normalized === "md") {
        return { type: "document", format: "markdown" };
    }

    return { type: "document", format: "markdown" };
}




export function normalizeLang(lang) {
    const normalized = lang.toLowerCase().trim();

    const aliasMap = {
        js: "javascript",
        ts: "typescript",
        py: "python",
        yml: "yaml",
        sh: "bash",
        shell: "bash",
        cs: "csharp",
        csharp: "csharp",
        md: "markdown",
        html: "html",
        xml: "html"   // often used interchangeably in fences
    };

    return aliasMap[normalized] || normalized;
}