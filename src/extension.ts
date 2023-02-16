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
		// testing
		vscode.window.showInformationMessage('dependencies found');
		let i=indexOfFirstDep;
		while (i < textArr.length&&!new RegExp(/\s*}/).test(textArr[i])) {
			// return arr with the dep name if it exists or null if it doesn't
			const depArr=/\s*"(.*)"\s*:/.exec(textArr[i]);
			if(!depArr){
				// no match
				i++;
				continue;
			}
			// dependency found
			const depName=depArr[1];
			const folder = vscode.workspace.getWorkspaceFolder(doc.uri);
			const nodeModulesPath = folder ? `{${folder.uri.fsPath}/node_modules/${depName}` : '';
			// now i should search if this dependency installed or not


			i++;
		}
	}

	return diagnostics;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('types-installer');

	const handler = async (doc: vscode.TextDocument) => {
		if (!doc.fileName.endsWith('package.json')) {
			vscode.window.showInformationMessage(doc.fileName);
			return;
		}
		vscode.window.showInformationMessage('package.json found');
		const diagnostics = await getDiagnostics(doc);
		diagnosticCollection.set(doc.uri, diagnostics);
	};

	const didOpen = vscode.workspace.onDidOpenTextDocument(doc => handler(doc));
	const didChange = vscode.workspace.onDidChangeTextDocument(event => handler(event.document));


}

// this method is called when your extension is deactivated
export function deactivate() { }