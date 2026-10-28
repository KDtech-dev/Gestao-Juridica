<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Documentação da API | Central Jurídica</title>
    <style>
        :root {
            color-scheme: light;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #172033;
            background: #f4f6fa;
            font-synthesis: none;
            text-rendering: optimizeLegibility;
        }
        * { box-sizing: border-box; }
        body { display: flex; min-height: 100vh; margin: 0; flex-direction: column; }
        header {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 22px clamp(18px, 3vw, 48px);
            color: #fff;
            background: #172b4d;
            border-bottom: 4px solid #d1a94b;
        }
        .brand-logo { display: block; width: 58px; height: 58px; flex: 0 0 58px; object-fit: contain; }
        .brand-copy { min-width: 0; }
        header strong { font-size: 14px; letter-spacing: .08em; text-transform: uppercase; }
        header p { margin: 8px 0 0; color: #d5deed; font-size: 14px; }
        main {
            width: 100%;
            flex: 1;
            margin: 0;
            padding: clamp(20px, 3vw, 44px);
            background: #fff;
        }
        article { line-height: 1.65; overflow-wrap: anywhere; }
        h1, h2, h3 { color: #172b4d; line-height: 1.25; }
        h1 { margin-top: 0; font-size: clamp(30px, 5vw, 42px); }
        h2 { margin-top: 46px; padding-bottom: 10px; border-bottom: 1px solid #e6eaf0; }
        h3 { margin-top: 32px; }
        .doc-accordion {
            margin: 14px 0;
            border: 1px solid #e1e6ef;
            border-radius: 11px;
            background: #fff;
        }
        .doc-accordion > summary {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 18px;
            color: #172b4d;
            cursor: pointer;
            font-weight: 700;
            list-style: none;
        }
        .doc-accordion > summary:focus-visible {
            outline: 3px solid #d1a94b;
            outline-offset: 2px;
        }
        .doc-accordion > summary::-webkit-details-marker { display: none; }
        .doc-accordion > summary::before {
            content: "";
            width: 8px;
            height: 8px;
            flex: 0 0 8px;
            border-right: 2px solid #59708e;
            border-bottom: 2px solid #59708e;
            transform: rotate(-45deg);
            transition: transform .16s ease;
        }
        .doc-accordion[open] > summary::before { transform: rotate(45deg); }
        .doc-accordion[open] > summary { border-bottom: 1px solid #e8ecf2; }
        .doc-accordion-content { padding: 8px 18px 18px; }
        .doc-accordion-content > :first-child { margin-top: 8px; }
        .doc-accordion-content > :last-child { margin-bottom: 0; }
        .doc-accordion-content .doc-accordion { margin: 12px 0; background: #fbfcfe; }
        .doc-accordion-content .doc-accordion > summary { padding: 13px 15px; font-size: 14px; }
        .doc-accordion-content .doc-accordion-content { padding: 4px 15px 16px; }
        p, li { color: #445066; }
        a { color: #1559a6; }
        code {
            padding: 2px 5px;
            border-radius: 5px;
            color: #183c68;
            background: #eef3f9;
            font: .9em ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        }
        pre {
            overflow-x: auto;
            padding: 18px;
            border-radius: 10px;
            color: #eaf0f8;
            background: #172033;
        }
        pre code { padding: 0; color: inherit; background: transparent; }
        table { width: 100%; margin: 18px 0 28px; border-collapse: collapse; font-size: 14px; }
        th, td { padding: 11px 13px; border: 1px solid #e1e6ef; text-align: left; vertical-align: top; }
        th { color: #172b4d; background: #f3f6fa; }
        tr:nth-child(even) td { background: #fbfcfe; }
        blockquote { margin-left: 0; padding: 2px 18px; border-left: 3px solid #d1a94b; }
        @media (max-width: 640px) {
            main { padding: 24px 16px 44px; }
            table { display: block; overflow-x: auto; white-space: normal; }
            th, td { min-width: 110px; }
        }
    </style>
</head>
<body>
    <header>
        <img class="brand-logo" src="/images/central-juridico-logo.png" alt="Logo Central Jurídico" width="58" height="58">
        <div class="brand-copy">
            <strong>Central Jurídica · Backend</strong>
            <p>Referência de endpoints, autenticação e permissões</p>
        </div>
    </header>
    <main>
        <article>{!! $documentation !!}</article>
    </main>
    <script>
        const article = document.querySelector("article");
        const originalNodes = Array.from(article.childNodes);
        const rendered = document.createDocumentFragment();
        let sectionContent = null;
        let operationContent = null;

        const accordion = (titleHtml) => {
            const details = document.createElement("details");
            details.className = "doc-accordion";

            const summary = document.createElement("summary");
            summary.innerHTML = titleHtml;

            const content = document.createElement("div");
            content.className = "doc-accordion-content";
            details.append(summary, content);

            return { details, content };
        };

        for (const node of originalNodes) {
            const isHeading = node.nodeType === Node.ELEMENT_NODE;

            if (isHeading && node.tagName === "H2") {
                sectionContent = null;
                operationContent = null;
                rendered.append(node);
            } else if (isHeading && node.tagName === "H3") {
                const section = accordion(node.innerHTML);
                sectionContent = section.content;
                operationContent = null;
                rendered.append(section.details);
            } else if (isHeading && node.tagName === "H4" && sectionContent) {
                const operation = accordion(node.innerHTML);
                operationContent = operation.content;
                sectionContent.append(operation.details);
            } else if (operationContent) {
                operationContent.append(node);
            } else if (sectionContent) {
                sectionContent.append(node);
            } else {
                rendered.append(node);
            }
        }

        article.replaceChildren(rendered);
    </script>
</body>
</html>
