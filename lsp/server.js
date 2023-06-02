const {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    Diagnostic,
    DiagnosticSeverity,
    SemanticTokensBuilder,
} = require('vscode-languageserver');

const { TextDocument } = require('vscode-languageserver-textdocument');

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

const tokenTypes = ['keyword', 'variable', 'string', 'function', 'variable'];
const tokenModifiers = [];

const controlKeywords = ['ken', 'la'];
const operateKeywords = ['print', 'number'];

connection.onInitialize((params) => {
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            semanticTokensProvider: {
                legend: {
                    tokenTypes: tokenTypes,
                    tokenModifiers: tokenModifiers
                },
                full: true
            }
        },
    };
});

documents.onDidChangeContent((change) => {
    const diagnostics = validateText(change.document.getText());
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
});

connection.onRequest('textDocument/semanticTokens/full', (params) => {
    const document = documents.get(params.textDocument.uri);
    return tokenizeDocument(document);
});

connection.listen();
documents.listen(connection);

function validateText(text) {
    const diagnostics = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].match(/"[^"]*"|\S+/g);

        parts.forEach((part) => {
            const isCapitalized = part[0] === part[0].toUpperCase();
            if (part.startsWith('"') && part.endsWith('"')) {
                return;
            }
            if (!controlKeywords.includes(part) && !operateKeywords.includes(part)) {
                if (isCapitalized) {
                    return;
                }

                diagnostics.push({
                    severity: DiagnosticSeverity.Error,
                    range: {
                        start: { line: i, character: lines[i].indexOf(part) },
                        end: { line: i, character: lines[i].indexOf(part) + part.length },
                    },
                    message: `${part}: nimi ike.`,
                    source: 'ex',
                });
            }
        });
    }

    return diagnostics;
}

function tokenizeDocument(document) {
    const content = document.getText();
    const lines = content.split('\n');
    const builder = new SemanticTokensBuilder();

    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].match(/"[^"]*"|\S+/g);

        parts.forEach((part) => {
            const start = lines[i].indexOf(part);
            const length = part.length;
            const isCapitalized = part[0] === part[0].toUpperCase();

            if (part.startsWith('"') && part.endsWith('"')) {
                builder.push(i, start, length, "string", []);
            } else if (controlKeywords.includes(part) || operateKeywords.includes(part)) {
                builder.push(i, start, length, "keyword", []);
            } else if (isCapitalized) {
                builder.push(i, start, length, "variable", []);
            }
        });
    }

    return builder.build();
}
