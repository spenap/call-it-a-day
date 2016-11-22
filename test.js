#!/usr/bin/env gjs

imports.searchPath.unshift(".");
const TK = imports.timekeeper;

let tk = new TK.TimeKeeper();
tk.run();
