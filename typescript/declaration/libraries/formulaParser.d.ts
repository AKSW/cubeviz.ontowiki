// Typing for the json.js

interface formulaParser { 
    (): any;
    evaluate (): void;
    parse (formula:string): any;
}
declare var formulaParser: formulaParser;
