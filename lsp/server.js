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

const tokenTypes = ['keyword', 'variable', 'string', 'function', 'variable', 'numbers'];
const tokenModifiers = ['definition', 'reference'];

const controlKeywords = ['ken', 'la', 'ijo', 'e', 'ma', 'tawa', 'pini', 'o', 'ni'];
const operateKeywords = ['ala', 'anu', 'en', 'ante', 'mute', 'weka', 'li'];
const numbers = ['ala', 'wan', 'tu', 'luka', 'mute', 'ale', 'linja'];
const effectKeywords = ['nanpa', 'pana', 'toki'];


const legend = {
                    tokenTypes: tokenTypes,
                    tokenModifiers: tokenModifiers
                }

// Dynamically generate TokenType based on the provided legend
let TokenType = {};
legend.tokenTypes.forEach((type, i) => {
    TokenType[type.charAt(0).toUpperCase() + type.slice(1)] = i;
});

// Freeze the TokenType object
TokenType = Object.freeze(TokenType);

connection.onInitialize((params) => {
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            semanticTokensProvider: {
                legend: legend,
                full: true
            }
        },
    };
});

documents.onDidChangeContent((change) => {
    const diagnostics = validateText(change.document.getText());
    connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
    connection.languages.semanticTokens.refresh()
});

connection.languages.semanticTokens.on((params) => {
	const document = documents.get(params.textDocument.uri);
	if (document === undefined) {
		return { data: [] };
	}
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
    const builder = new SemanticTokensBuilder(legend);

    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].match(/"[^"]*"|\S+/g);

        parts.forEach((part) => {
            const start = lines[i].indexOf(part);
            const length = part.length;
            const isCapitalized = part[0] === part[0].toUpperCase();
            const range = {
                start: { line: i, character: start },
                end: { line: i, character: start + length }
            };

            if (part.startsWith('"') && part.endsWith('"')) {
                builder.push(range, "string", ['reference']);
            } else if (controlKeywords.includes(part)) {
                builder.push(range, "keyword", []);
            } else if (operateKeywords.includes(part)){
                builder.push(range, "operator", []);
            } else if (numbers.includes(part)){
                builder.push(range, "numbers", []);
            } else if (effectKeywords.includes(part)){
                builder.push(range, "functions", ['reference']);
            } else if (isCapitalized) {
                builder.push(range, "variable", ['definition']);
            }
        });
    }
    result = builder.build();
    // Write result to a file
    return result;
}