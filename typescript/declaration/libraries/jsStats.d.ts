// Typing for the json.js

interface jsStats { 
    max(numbers:number[]) : number;
    mean(numbers:number[]) : number;
    median(numbers:number[]) : number;
    min(numbers:number[]) : number;
    mode(numbers:number[]) : number[];
    variance(numbers:number[]) : number;
    standardDeviation(numbers:number[]) : number;
}
declare var jsStats: jsStats;
