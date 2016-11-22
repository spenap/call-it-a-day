#!/usr/bin/env gjs

imports.searchPath.unshift(".");
const TK = imports.timekeeper;

let tk = new TK.TimeKeeper(TK.TEST_TIME, function() { log("Hello callback"); });
tk.run();
