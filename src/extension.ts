import * as vscode from 'vscode';


interface PackageJson {
	name: string;
	types?: string;
	dependencies?: { [key: string]: string };
	devDependencies?: { [key: string]: string };
}



async function getDiagnostics(doc: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
	const text = doc.getText();
	const diagnostics = new Array<vscode.Diagnostic>();

	let packageJson: PackageJson;
	try {
		packageJson = JSON.parse(text);
	} catch (e) {
		return diagnostics;
	}

	const textArr: string[] = text.split(/\r\n|\n/);
	const indexOfFirstDep = textArr.findIndex((value: string) => new RegExp(`\s*"dependencies"`).test(value)) + 1;

	if (indexOfFirstDep !== -1) {
		// I should check all dependencies 
	}

	return diagnostics;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('types-installer');

	const handler = async (doc: vscode.TextDocument) => {
		if (!doc.fileName.endsWith('package.json')) {
			return;
		}

		const diagnostics = await getDiagnostics(doc);
		diagnosticCollection.set(doc.uri, diagnostics);
	};

	const didOpen = vscode.workspace.onDidOpenTextDocument(doc => handler(doc));
	const didChange = vscode.workspace.onDidChangeTextDocument(event => handler(event.document));


}

// this method is called when your extension is deactivated
export function deactivate() { }