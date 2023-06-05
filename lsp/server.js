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

const tokenTypes = ['keyword', 'variable', 'string', 'function', 'variable', 'numbers', 'comment'];
const tokenModifiers = ['definition', 'reference'];

const controlKeywords = ['ken', 'la', 'ijo', 'e', 'ma', 'tawa', 'pini', 'o', 'ni'];
const operateKeywords = ['ala', 'anu', 'en', 'ante', 'mute', 'weka', 'li'];
const numbers = ['ala', 'wan', 'tu', 'luka', 'mute', 'ale', 'linja'];
const effectKeywords = ['nanpa', 'pana', 'toki'];
const keywords = [...controlKeywords, ...operateKeywords, ...numbers, ...effectKeywords];

connection.onInitialize((params) => {
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            documentSymbolProvider: true, // Add this line
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
        if (lines[i].trim().startsWith("#")) {
          continue;
        }
        const parts = lines[i].match(/"[^"]*"|\S+/g);
        if(!parts) continue;
        parts.forEach((part) => {
            const isCapitalized = part[0] === part[0].toUpperCase();
            if (part.startsWith('"') && part.endsWith('"')) {
                return;
            }
            if (!keywords.includes(part)) {
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
// Update the onDocumentSymbol method
connection.onDocumentSymbol(({ textDocument }) => {
    const document = documents.get(textDocument.uri);

    if (!document) {
        return null;
    }

    const symbols = [];
    const lines = document.getText().split('\n');

    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].match(/"[^"]*"|\S+/g);
        
        parts.forEach((part) => {
            if (part[0] === part[0].toUpperCase()) {
                let kind;

                if (controlKeywords.includes(part)) {
                    kind = 12; // Function
                } else if (operateKeywords.includes(part)) {
                    kind = 25; // Operator
                } else if (numbers.includes(part)) {
                    kind = 16; // Number
                } else if (effectKeywords.includes(part)) {
                    kind = 6; // Method
                } else {
                    return; // Ignore unrecognized symbols
                }

                symbols.push({
                    name: part,
                    kind: kind,
                    location: {
                        uri: textDocument.uri,
                        range: {
                            start: { line: i, character: lines[i].indexOf(part) },
                            end: { line: i, character: lines[i].indexOf(part) + part.length },
                        }
                    }
                });
            }
        });
    }

    return symbols;
});