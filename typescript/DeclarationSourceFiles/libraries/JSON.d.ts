// Typing for the json.js

interface JSON { 
    stringify (value:any, replacer:any, space:any): string;
}
declare var JSON: JSON;
