import * as vscode from "vscode";

interface PackageJson {
  name: string;
  types?: string;
  dependencies?: { [key: string]: string };
  devDependencies?: { [key: string]: string };
}

async function doesDependencyInstalled(
  nodeModulesPath: vscode.Uri,
  mainPackageJson: PackageJson,
  targetPackage: string
): Promise<boolean> {
  // check if the modules exist and it's index.d.ts file exists
  const file = await vscode.workspace.findFiles(
    `node_modules/${targetPackage}/index.d.ts`
  );
  console.log(file);
  return file.length > 0;
}

async function installIfNotInstalled(doc: vscode.TextDocument): Promise<void> {
  const text = doc.getText();

  let packageJson: PackageJson;
  try {
    packageJson = JSON.parse(text);
  } catch (e) {
    return;
  }

  const textArr: string[] = text.split(/\r\n|\n/);
  const indexOfFirstDep =
    textArr.findIndex((value: string) =>
      new RegExp(`\s*"dependencies"`).test(value)
    ) + 1;

  if (indexOfFirstDep !== -1) {
    // I should check all dependencies
    // testing
    vscode.window.showInformationMessage("dependencies found");
    let i = indexOfFirstDep;
    while (i < textArr.length && !new RegExp(/\s*}/).test(textArr[i])) {
      // return arr with the dep name if it exists or null if it doesn't
      const depArr = /\s*"(.*)"\s*:/.exec(textArr[i]);
      if (!depArr) {
        // no match
        i++;
        continue;
      }
      // dependency found
      const depName = depArr[1];
      const folder = vscode.workspace.getWorkspaceFolder(doc.uri);
      const nodeModulesPath: vscode.Uri = vscode.Uri.joinPath(
        folder!.uri,
        "node_modules",
        depName
      );
      const typesPackageName = `${depName}`;
      console.log(typesPackageName);
      const diagnostic = await doesDependencyInstalled(
        nodeModulesPath,
        packageJson,
        depName
      );
      console.log(diagnostic);
      // now i should search if this dependency installed or not
      if (!diagnostic) {
        const startIndex = textArr[i].indexOf(depName);
        const endIndex = startIndex + depName.length;

        const shellExec = new vscode.ShellExecution(`npm install ${depName}`);
        vscode.tasks.executeTask(
          new vscode.Task(
            { type: "types installer" },
            vscode.TaskScope.Workspace,
            "typesinstaller",
            "types installer",
            shellExec
          )
        );
        console.log("task executed");
      }

      i++;
    }
  }

  return;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const handler = async (doc: vscode.TextDocument) => {
    if (!doc.fileName.endsWith("package.json")) {
      return;
    }
    vscode.window.showInformationMessage("package.json found");
    await installIfNotInstalled(doc);
  };

  const didOpen = vscode.workspace.onDidOpenTextDocument((doc) => handler(doc));
  const didChange = vscode.workspace.onDidChangeTextDocument((event) =>
    handler(event.document)
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
